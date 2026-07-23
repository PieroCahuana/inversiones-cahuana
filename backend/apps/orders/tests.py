from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.carts.models import Cart, CartItem
from apps.categories.models import Category
from apps.inventory.models import InventoryMovement
from apps.products.models import Product
from apps.storefront.models import StoreSettings

from .models import Order, PaymentReceipt


class CustomerOrderAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(username="cliente", email="cliente@example.com", password="StrongPassword123!")
        self.other_user = user_model.objects.create_user(username="otro", email="otro@example.com", password="StrongPassword123!")
        brand = Brand.objects.create(name="Dell")
        category = Category.objects.create(name="Laptops")
        self.product = Product.objects.create(
            sku="DELL-ORDER-01",
            name="Dell Latitude 7440",
            short_description="Laptop empresarial",
            description="Equipo para trabajo.",
            brand=brand,
            category=category,
            price=Decimal("3200.00"),
            discount_price=Decimal("3000.00"),
            stock=5,
        )
        self.checkout_data = {
            "payment_method": Order.PaymentMethod.YAPE,
            "recipient_name": "Piero Cahuana",
            "recipient_phone": "954107191",
            "department": "Lima",
            "province": "Lima",
            "district": "Cercado de Lima",
            "address": "Jr. Leticia 949",
            "address_reference": "Stand 109",
            "notes": "Llamar antes de entregar",
        }

    def add_to_cart(self, user, quantity=1):
        cart, _ = Cart.objects.get_or_create(user=user)
        return CartItem.objects.create(cart=cart, product=self.product, quantity=quantity)

    def test_checkout_requires_authentication(self):
        response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_checkout_creates_order_updates_stock_and_clears_cart(self):
        self.add_to_cart(self.user, quantity=2)
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(user=self.user)
        self.product.refresh_from_db()
        self.assertEqual(order.subtotal, Decimal("6000.00"))
        self.assertEqual(order.total, Decimal("6000.00"))
        self.assertEqual(order.items.get().product_name, self.product.name)
        self.assertEqual(self.product.stock, 3)
        self.assertFalse(CartItem.objects.filter(cart__user=self.user).exists())
        movement = InventoryMovement.objects.get(reference=order.order_number)
        self.assertEqual(movement.quantity, 2)
        self.assertEqual(movement.new_stock, 3)

    def test_checkout_applies_configured_shipping_cost(self):
        settings = StoreSettings.load()
        settings.shipping_cost = Decimal("18.00")
        settings.free_shipping_minimum = Decimal("5000.00")
        settings.save()
        self.add_to_cart(self.user)
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data["order"]["shipping_cost"]), Decimal("18.00"))
        self.assertEqual(Decimal(response.data["order"]["total"]), Decimal("3018.00"))

    def test_checkout_rejects_empty_cart(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Order.objects.filter(user=self.user).exists())

    def test_checkout_is_atomic_when_stock_is_insufficient(self):
        self.add_to_cart(self.user, quantity=6)
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
        self.assertFalse(Order.objects.filter(user=self.user).exists())
        self.assertTrue(CartItem.objects.filter(cart__user=self.user).exists())
        self.assertFalse(InventoryMovement.objects.exists())

    def test_order_list_and_detail_only_show_authenticated_users_orders(self):
        self.add_to_cart(self.user)
        self.client.force_authenticate(self.user)
        checkout_response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        order_number = checkout_response.data["order"]["order_number"]

        self.client.force_authenticate(self.other_user)
        list_response = self.client.get("/api/orders/")
        detail_response = self.client.get(f"/api/orders/{order_number}/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_order_list_supports_search_and_status_filter(self):
        self.add_to_cart(self.user)
        self.client.force_authenticate(self.user)
        checkout_response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        order_number = checkout_response.data["order"]["order_number"]

        response = self.client.get("/api/orders/", {"search": order_number[-5:], "status": "pending"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["order_number"], order_number)

    def test_customer_uploads_receipt_and_admin_approves_it(self):
        self.add_to_cart(self.user)
        self.client.force_authenticate(self.user)
        checkout_response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        order_number = checkout_response.data["order"]["order_number"]
        receipt_file = SimpleUploadedFile("pago.png", b"fake-image-content", content_type="image/png")
        upload_response = self.client.post(f"/api/orders/{order_number}/receipt/", {"file": receipt_file, "customer_note": "Operación 123"}, format="multipart")
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        receipt = PaymentReceipt.objects.get(order__order_number=order_number)
        self.assertEqual(receipt.status, PaymentReceipt.Status.PENDING)

        admin = get_user_model().objects.create_user(username="admin", email="admin@example.com", password="StrongPassword123!", role="admin")
        self.client.force_authenticate(admin)
        review_response = self.client.patch(f"/api/orders/admin/{order_number}/receipt/", {"status": "approved", "review_note": "Pago validado"}, format="json")
        self.assertEqual(review_response.status_code, status.HTTP_200_OK)
        receipt.refresh_from_db()
        receipt.order.refresh_from_db()
        self.assertEqual(receipt.status, PaymentReceipt.Status.APPROVED)
        self.assertEqual(receipt.order.payment_status, Order.PaymentStatus.PAID)

    def test_user_cannot_upload_receipt_to_another_users_order(self):
        self.add_to_cart(self.user)
        self.client.force_authenticate(self.user)
        checkout_response = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        order_number = checkout_response.data["order"]["order_number"]
        self.client.force_authenticate(self.other_user)
        receipt_file = SimpleUploadedFile("pago.png", b"fake-image-content", content_type="image/png")
        response = self.client.post(f"/api/orders/{order_number}/receipt/", {"file": receipt_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
