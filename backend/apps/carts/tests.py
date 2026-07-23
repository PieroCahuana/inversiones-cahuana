from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product


class CartAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="cliente",
            email="cliente@example.com",
            password="StrongPassword123!",
        )
        brand = Brand.objects.create(name="Lenovo")
        category = Category.objects.create(name="Laptops")
        self.product = Product.objects.create(
            sku="LEN-001",
            name="Lenovo ThinkPad E14",
            short_description="Laptop para trabajo",
            description="Equipo empresarial.",
            brand=brand,
            category=category,
            price=Decimal("3000.00"),
            discount_price=Decimal("2700.00"),
            stock=4,
        )
        self.cart_url = "/api/cart/"
        self.items_url = "/api/cart/items/"
        self.clear_url = "/api/cart/clear/"

    def test_cart_requires_authentication(self):
        response = self.client.get(self.cart_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_product_and_get_totals(self):
        self.client.force_authenticate(self.user)

        add_response = self.client.post(
            self.items_url,
            {"product_id": self.product.id, "quantity": 2},
            format="json",
        )
        cart_response = self.client.get(self.cart_url)

        self.assertEqual(add_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(cart_response.status_code, status.HTTP_200_OK)
        self.assertEqual(cart_response.data["total_items"], 2)
        self.assertEqual(Decimal(cart_response.data["subtotal"]), Decimal("5400.00"))
        self.assertEqual(cart_response.data["items"][0]["product"]["slug"], self.product.slug)

    def test_adding_same_product_increments_quantity(self):
        self.client.force_authenticate(self.user)
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 2}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["item"]["quantity"], 3)

    def test_update_quantity_validates_stock(self):
        self.client.force_authenticate(self.user)
        add_response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        item_id = add_response.data["item"]["id"]

        valid_response = self.client.patch(f"/api/cart/items/{item_id}/", {"quantity": 4}, format="json")
        invalid_response = self.client.patch(f"/api/cart/items/{item_id}/", {"quantity": 5}, format="json")

        self.assertEqual(valid_response.status_code, status.HTTP_200_OK)
        self.assertEqual(valid_response.data["item"]["quantity"], 4)
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_item_and_clear_cart(self):
        self.client.force_authenticate(self.user)
        add_response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        item_id = add_response.data["item"]["id"]

        delete_response = self.client.delete(f"/api/cart/items/{item_id}/")
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        clear_response = self.client.delete(self.clear_url)
        cart_response = self.client.get(self.cart_url)

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(clear_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(cart_response.data["items"], [])
        self.assertEqual(cart_response.data["total_items"], 0)
