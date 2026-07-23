from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category

from .models import Product
from .management.commands.import_stand_inventory import PRODUCTS


class ProductCatalogAPITests(APITestCase):
    def setUp(self):
        self.dell = Brand.objects.create(name="Dell")
        self.hp = Brand.objects.create(name="HP")
        self.laptops = Category.objects.create(name="Laptops")
        self.computers = Category.objects.create(name="Computadoras")
        self.list_url = reverse("product-list")

        self.latitude = Product.objects.create(
            sku="DELL-001",
            name="Dell Latitude 5420",
            short_description="Laptop empresarial",
            description="Equipo para trabajo profesional.",
            brand=self.dell,
            category=self.laptops,
            price=Decimal("2500.00"),
            stock=5,
            condition=Product.Condition.NEW,
            is_featured=True,
        )
        Product.objects.create(
            sku="HP-001",
            name="HP ProDesk 400",
            short_description="Computadora de escritorio",
            description="Equipo compacto para oficina.",
            brand=self.hp,
            category=self.computers,
            price=Decimal("1800.00"),
            stock=0,
            condition=Product.Condition.REFURBISHED,
        )

    def test_list_uses_standard_pagination(self):
        response = self.client.get(self.list_url, {"page_size": 1})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIsNotNone(response.data["next"])

    def test_combined_catalog_filters(self):
        response = self.client.get(
            self.list_url,
            {
                "category": self.laptops.slug,
                "brand": self.dell.slug,
                "condition": Product.Condition.NEW,
                "in_stock": "true",
                "min_price": "2000",
                "max_price": "3000",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], self.latitude.slug)

    def test_search_and_ordering(self):
        response = self.client.get(
            self.list_url,
            {"search": "oficina", "ordering": "price"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["sku"], "HP-001")

    def test_inactive_products_are_hidden_from_public_catalog(self):
        self.latitude.is_active = False
        self.latitude.save(update_fields=["is_active"])

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertNotEqual(response.data["results"][0]["slug"], self.latitude.slug)

    def test_product_detail_returns_structured_catalog_data(self):
        self.latitude.specifications = {
            "processor": "Intel Core i5",
            "ram": "16 GB",
        }
        self.latitude.save(update_fields=["specifications"])

        response = self.client.get(
            reverse("product-detail", kwargs={"slug": self.latitude.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["brand"]["slug"], self.dell.slug)
        self.assertEqual(response.data["category"]["slug"], self.laptops.slug)
        self.assertEqual(response.data["specifications"]["ram"], "16 GB")
        self.assertEqual(response.data["images"], [])

    def test_inactive_product_detail_is_not_public(self):
        self.latitude.is_active = False
        self.latitude.save(update_fields=["is_active"])

        response = self.client.get(
            reverse("product-detail", kwargs={"slug": self.latitude.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StandInventoryImportTests(TestCase):
    def test_import_is_idempotent_and_aggregates_available_units(self):
        with TemporaryDirectory() as media_root:
            image_dir = Path(media_root) / "products" / "catalog"
            image_dir.mkdir(parents=True)
            for filename in {item["image"] for item in PRODUCTS if item["image"]}:
                (image_dir / filename).touch()

            with override_settings(MEDIA_ROOT=media_root):
                call_command("import_stand_inventory", verbosity=0)
                call_command("import_stand_inventory", verbosity=0)

        self.assertEqual(Product.objects.filter(sku__in=[p["sku"] for p in PRODUCTS]).count(), 20)
        self.assertEqual(sum(product.stock for product in Product.objects.all()), 32)
        self.assertEqual(Product.objects.get(sku="LEN-M80Q-G2-I5-10").stock, 10)
        self.assertEqual(Product.objects.get(sku="DELL-LAT-3510-I5").stock, 2)
        self.assertEqual(
            Product.objects.filter(images__isnull=True).count(),
            0,
        )
