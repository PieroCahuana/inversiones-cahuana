import decimal
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="StoreSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("business_name", models.CharField(default="Inversiones Cahuana", max_length=150)),
                ("phone", models.CharField(default="954107191", max_length=20)),
                ("whatsapp", models.CharField(default="51954107191", max_length=20)),
                ("address", models.TextField(default="Jr. Leticia 949, Stand 109\nJr. Leticia 948, Stand 29B\nCercado de Lima")),
                ("opening_hours", models.CharField(default="Lunes a sábado, 9:00 a.m. a 7:00 p.m.", max_length=255)),
                ("support_text", models.CharField(default="Soporte técnico especializado", max_length=255)),
                ("facebook_url", models.URLField(blank=True, default="https://www.facebook.com/61591996100219/")),
                ("yape_number", models.CharField(blank=True, max_length=20)),
                ("yape_holder", models.CharField(blank=True, max_length=150)),
                ("plin_number", models.CharField(blank=True, max_length=20)),
                ("plin_holder", models.CharField(blank=True, max_length=150)),
                ("bank_details", models.TextField(blank=True)),
                ("shipping_cost", models.DecimalField(decimal_places=2, default=decimal.Decimal("0.00"), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.00"))])),
                ("free_shipping_minimum", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.00"))])),
                ("low_stock_threshold", models.PositiveIntegerField(default=5)),
                ("checkout_message", models.CharField(default="Coordinaremos el pago y la entrega contigo.", max_length=255)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "configuración de tienda", "verbose_name_plural": "configuración de tienda"},
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("notification_type", models.CharField(choices=[("order", "Pedido"), ("payment", "Pago"), ("inventory", "Inventario"), ("system", "Sistema")], default="system", max_length=20)),
                ("title", models.CharField(max_length=150)),
                ("message", models.CharField(max_length=300)),
                ("link", models.CharField(blank=True, max_length=255)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"], "indexes": [models.Index(fields=["user", "is_read", "created_at"], name="store_notif_user_read_idx")]},
        ),
    ]
