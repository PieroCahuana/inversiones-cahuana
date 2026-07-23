from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.carts.models import Cart, CartItem
from apps.categories.models import Category
from apps.orders.models import Order
from apps.products.models import Product

from .models import Banner, Coupon, CouponUsage, Promotion


class PromotionsAPITests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.customer = users.objects.create_user(username="promo-customer", email="promo@example.com", password="StrongPassword123!")
        self.admin = users.objects.create_user(username="promo-admin", email="promo-admin@example.com", password="StrongPassword123!", role="admin")
        brand = Brand.objects.create(name="Promo Brand")
        category = Category.objects.create(name="Promo Category")
        self.product = Product.objects.create(sku="PROMO-01", name="Equipo promocional", description="Producto de prueba", brand=brand, category=category, price=Decimal("100.00"), stock=10)
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        now = timezone.now()
        self.promotion = Promotion.objects.create(name="Campaña 10", scope="all", discount_percentage=Decimal("10.00"), starts_at=now - timedelta(days=1), ends_at=now + timedelta(days=1), is_active=True)
        self.coupon = Coupon.objects.create(code="AHORRA10", discount_type="percentage", value=Decimal("10.00"), minimum_purchase=Decimal("100.00"), starts_at=now - timedelta(days=1), ends_at=now + timedelta(days=1), usage_limit_per_user=1)
        self.checkout_data = {"payment_method": "yape", "recipient_name": "Cliente Promoción", "recipient_phone": "999999999", "department": "Lima", "province": "Lima", "district": "Lima", "address": "Dirección de prueba 123", "address_reference": "", "notes": "", "coupon_code": "AHORRA10"}

    def test_active_promotion_changes_catalog_and_cart_price(self):
        product_response = self.client.get("/api/products/")
        self.client.force_authenticate(self.customer)
        cart_response = self.client.get("/api/cart/")
        self.assertEqual(Decimal(product_response.data["results"][0]["current_price"]), Decimal("90.00"))
        self.assertEqual(Decimal(cart_response.data["items"][0]["unit_price"]), Decimal("90.00"))
        self.assertEqual(Decimal(cart_response.data["subtotal"]), Decimal("180.00"))

    def test_coupon_validation_and_checkout_persist_discount(self):
        self.client.force_authenticate(self.customer)
        validation = self.client.post("/api/commerce/coupon/validate/", {"code": "AHORRA10"}, format="json")
        checkout = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        self.assertEqual(validation.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(validation.data["discount_amount"]), Decimal("18.00"))
        self.assertEqual(checkout.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(user=self.customer)
        self.assertEqual(order.subtotal, Decimal("180.00"))
        self.assertEqual(order.discount_amount, Decimal("18.00"))
        self.assertEqual(order.total, Decimal("162.00"))
        self.assertTrue(CouponUsage.objects.filter(order=order, coupon=self.coupon).exists())

    def test_coupon_cannot_be_used_twice_by_same_customer(self):
        self.client.force_authenticate(self.customer)
        first = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        CartItem.objects.create(cart=Cart.objects.get(user=self.customer), product=self.product, quantity=1)
        second = self.client.post("/api/orders/checkout/", self.checkout_data, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)

    def test_active_banners_are_public_and_crud_is_admin_only(self):
        now = timezone.now()
        Banner.objects.create(title="Oferta vigente", image_url="https://example.com/banner.jpg", starts_at=now - timedelta(hours=1), ends_at=now + timedelta(hours=1))
        public = self.client.get("/api/commerce/banners/active/")
        denied = self.client.get("/api/commerce/banners/")
        self.client.force_authenticate(self.admin)
        allowed = self.client.get("/api/commerce/banners/")
        self.assertEqual(public.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public.data), 1)
        self.assertEqual(denied.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
