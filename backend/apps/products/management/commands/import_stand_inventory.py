"""Import the saleable equipment from the 20 July 2026 stand inventory.

The source workbook contains one row per physical unit.  This command publishes
only available equipment with an identifiable model and a valid price. Sold,
repair, assigned and ambiguous rows are intentionally excluded.
"""

from decimal import Decimal
from pathlib import Path
from shutil import copy2

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product, ProductImage


SOURCE = "INVENTARIO DE STAND 20JULIO 2026ubicacion.xlsx"
SEED_IMAGE_DIR = Path(__file__).resolve().parent.parent / "seed_images"


def laptop(sku, name, brand, price, stock, processor, ram, storage, screen,
           image, *, featured=False, graphics="Integrados", touch="No"):
    return {
        "sku": sku,
        "name": name,
        "brand": brand,
        "category": "Laptops",
        "price": price,
        "stock": stock,
        "image": image,
        "featured": featured,
        "specifications": {
            "processor": processor,
            "ram": ram,
            "storage": storage,
            "screen": screen,
            "graphics": graphics,
            "touch": touch,
        },
    }


def all_in_one(sku, name, brand, price, stock, processor, ram, storage, screen,
               image, *, featured=False):
    return {
        "sku": sku,
        "name": name,
        "brand": brand,
        "category": "All in One",
        "price": price,
        "stock": stock,
        "image": image,
        "featured": featured,
        "specifications": {
            "processor": processor,
            "ram": ram,
            "storage": storage,
            "screen": screen,
            "format": "Todo en uno",
        },
    }


PRODUCTS = [
    laptop("DELL-LAT-7490-I7-8-512", "Dell Latitude 7490", "Dell", 1050, 1,
           "Intel Core i7 de 8.ª generación", "8 GB", "SSD 512 GB", "14 pulgadas",
           "dell-latitude-7490.jpg", featured=True),
    laptop("LEN-T480-I7-8-512", "Lenovo ThinkPad T480 - 512 GB", "Lenovo", 1000, 1,
           "Intel Core i7 de 8.ª generación", "8 GB", "SSD 512 GB", "14 pulgadas",
           "lenovo-thinkpad-t480.jpg", featured=True),
    laptop("LEN-T480-I7-8-256", "Lenovo ThinkPad T480 - 256 GB", "Lenovo", 1000, 1,
           "Intel Core i7 de 8.ª generación", "8 GB", "SSD 256 GB", "14 pulgadas",
           "lenovo-thinkpad-t480.jpg"),
    laptop("DELL-LAT-5430-I5-12-512", "Dell Latitude 5430", "Dell", 1100, 1,
           "Intel Core i5 de 12.ª generación", "8 GB", "SSD 512 GB", "14 pulgadas",
           "dell-latitude-5430.jpg", featured=True),
    laptop("DELL-LAT-E7470-I7-6-256", "Dell Latitude E7470", "Dell", 800, 1,
           "Intel Core i7 de 6.ª generación", "8 GB", "SSD 256 GB", "14 pulgadas",
           "dell-latitude-e7470.jpg"),
    laptop("LEN-YOGA-520-I5-7-256", "Lenovo Yoga 520-14IKB", "Lenovo", 800, 1,
           "Intel Core i5 de 7.ª generación", "8 GB", "SSD 256 GB", "14 pulgadas",
           "lenovo-yoga-520.jpg", touch="Sí"),
    all_in_one("HP-PROONE-400-G4-I3-8", "HP ProOne 400 G4", "HP", 650, 1,
               "Intel Core i3 de 8.ª generación", "8 GB", "HDD 500 GB", "23.8 pulgadas",
               "hp-proone-400-g4.png"),
    laptop("DELL-LAT-3510-I5", "Dell Latitude 3510", "Dell", 950, 2,
           "Intel Core i5 de 10.ª generación", "8 GB", "SSD 256 GB", "15.6 pulgadas",
           "dell-latitude-3510.jpg", featured=True),
    laptop("DELL-LAT-3420-I5-11-256", "Dell Latitude 3420", "Dell", 1100, 1,
           "Intel Core i5 de 11.ª generación", "8 GB", "SSD 256 GB", "14 pulgadas",
           "dell-latitude-3420.jpg"),
    laptop("ACER-A315-56-I3-10-256", "Acer Aspire 3 A315-56", "Acer", 850, 1,
           "Intel Core i3 de 10.ª generación", "8 GB", "SSD 256 GB", "15.6 pulgadas",
           "acer-aspire-a315-56.jpg"),
    all_in_one("LEN-M920Z-I7-8-256", "Lenovo ThinkCentre M920z", "Lenovo", 1300, 1,
               "Intel Core i7 de 8.ª generación", "8 GB", "SSD 256 GB", "23.8 pulgadas",
               "lenovo-thinkcentre-m920z.jpg", featured=True),
    all_in_one("HP-24-F0XX-I3-8-1TB", "HP All-in-One 24-f0xx", "HP", 750, 1,
               "Intel Core i3 de 8.ª generación", "8 GB", "HDD 1 TB", "23.8 pulgadas",
               "hp-24-f0xx.png"),
    all_in_one("HP-200-G3-I5-8-1TB", "HP 200 G3 All-in-One", "HP", 850, 1,
               "Intel Core i5 de 8.ª generación", "8 GB", "HDD 1 TB", "21.5 pulgadas",
               "hp-200-g3.jpg"),
    all_in_one("LEN-M820Z-I7-8-1TB", "Lenovo ThinkCentre M820z", "Lenovo", 1200, 1,
               "Intel Core i7 de 8.ª generación", "8 GB", "HDD 1 TB", "21.5 pulgadas",
               "lenovo-thinkcentre-m820z.jpg"),
    laptop("DELL-LAT-3410-I5", "Dell Latitude 3410", "Dell", 950, 2,
           "Intel Core i5 de 10.ª generación", "8 GB", "SSD 256 GB", "14 pulgadas",
           "dell-latitude-3410.jpg"),
    laptop("DELL-LAT-3520-I7-11-512", "Dell Latitude 3520", "Dell", 1300, 1,
           "Intel Core i7 de 11.ª generación", "8 GB", "SSD 512 GB", "15.6 pulgadas",
           "dell-latitude-3520.jpg", featured=True, graphics="Gráficos dedicados de 2 GB"),
    laptop("DELL-LAT-3510-I7-10-512", "Dell Latitude 3510 Core i7", "Dell", 1300, 1,
           "Intel Core i7 de 10.ª generación", "8 GB", "SSD 512 GB", "15.6 pulgadas",
           "dell-latitude-3510.jpg"),
    laptop("HP-250-G8-I7-10-512", "HP 250 G8", "HP", 1300, 2,
           "Intel Core i7 de 10.ª generación", "8 GB", "SSD 512 GB", "15.6 pulgadas",
           "hp-250-g8.jpg", featured=True, graphics="Gráficos dedicados"),
    {
        "sku": "LEN-M80Q-G2-I5-10",
        "name": "Lenovo ThinkCentre M80q Gen 2",
        "brand": "Lenovo",
        "category": "PCs de escritorio",
        "price": 750,
        "stock": 10,
        "image": "lenovo-thinkcentre-m80q.jpg",
        "featured": True,
        "specifications": {
            "processor": "Intel Core i5 de 10.ª generación",
            "ram": "8 GB",
            "storage": "Consultar disponibilidad",
            "format": "Mini PC",
        },
    },
    laptop("DELL-INSP-3501-I5-11-256", "Dell Inspiron 3501", "Dell", 1000, 1,
           "Intel Core i5 de 11.ª generación", "8 GB", "SSD 256 GB", "15.6 pulgadas",
           "dell-inspiron-3501.jpg", graphics="Gráficos dedicados de 2 GB"),
]


class Command(BaseCommand):
    help = "Publica en el catálogo el inventario disponible del stand del 20/07/2026."

    @transaction.atomic
    def handle(self, *args, **options):
        image_dir = Path(settings.MEDIA_ROOT) / "products" / "catalog"
        image_dir.mkdir(parents=True, exist_ok=True)
        missing_seed_images = []
        for filename in {item["image"] for item in PRODUCTS if item["image"]}:
            destination = image_dir / filename
            if destination.is_file():
                continue
            source = SEED_IMAGE_DIR / filename
            if not source.is_file():
                missing_seed_images.append(filename)
                continue
            copy2(source, destination)

        if missing_seed_images:
            raise CommandError(
                "Faltan imágenes empaquetadas: " + ", ".join(sorted(missing_seed_images))
            )

        created_count = 0
        updated_count = 0

        for item in PRODUCTS:
            brand, _ = Brand.objects.get_or_create(
                name=item["brand"],
                defaults={"description": f"Equipos {item['brand']} disponibles en tienda."},
            )
            category, _ = Category.objects.get_or_create(
                name=item["category"],
                defaults={"description": f"Catálogo de {item['category'].lower()}."},
            )
            short = self._short_description(item)
            product, created = Product.objects.update_or_create(
                sku=item["sku"],
                defaults={
                    "name": item["name"],
                    "short_description": short,
                    "description": (
                        f"{item['name']} reacondicionado, revisado y listo para trabajar. "
                        "Consulta disponibilidad antes de realizar tu compra."
                    ),
                    "brand": brand,
                    "category": category,
                    "price": Decimal(str(item["price"])),
                    "discount_price": None,
                    "stock": item["stock"],
                    "condition": Product.Condition.REFURBISHED,
                    "specifications": item["specifications"],
                    "is_featured": item.get("featured", False),
                    "is_active": True,
                },
            )
            created_count += int(created)
            updated_count += int(not created)
            self._set_image(product, item["image"])

        total_units = sum(item["stock"] for item in PRODUCTS)
        self.stdout.write(self.style.SUCCESS(
            f"Inventario importado desde {SOURCE}: {created_count} productos creados, "
            f"{updated_count} actualizados y {total_units} unidades publicadas."
        ))

    @staticmethod
    def _short_description(item):
        specs = item["specifications"]
        details = [specs["processor"], specs["ram"], specs["storage"]]
        if specs.get("screen"):
            details.append(specs["screen"])
        return " · ".join(details)

    @staticmethod
    def _set_image(product, filename):
        if not filename:
            return
        image_name = f"products/catalog/{filename}"
        primary = product.images.filter(is_primary=True).first()
        if primary:
            if primary.image.name != image_name:
                primary.image.name = image_name
                primary.alt_text = product.name
                primary.save(update_fields=["image", "alt_text"])
            return
        ProductImage.objects.create(
            product=product,
            image=image_name,
            alt_text=product.name,
            is_primary=True,
            order=0,
        )
