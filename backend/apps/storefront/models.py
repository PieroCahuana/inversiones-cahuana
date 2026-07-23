from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class StoreSettings(models.Model):
    business_name = models.CharField(max_length=150, default="Inversiones Cahuana")
    phone = models.CharField(max_length=20, default="954107191")
    whatsapp = models.CharField(max_length=20, default="51954107191")
    address = models.TextField(default="Jr. Leticia 949, Stand 109\nJr. Leticia 948, Stand 29B\nCercado de Lima")
    opening_hours = models.CharField(max_length=255, default="Lunes a sábado, 9:00 a.m. a 7:00 p.m.")
    support_text = models.CharField(max_length=255, default="Soporte técnico especializado")
    facebook_url = models.URLField(blank=True, default="https://www.facebook.com/61591996100219/")
    yape_number = models.CharField(max_length=20, blank=True)
    yape_holder = models.CharField(max_length=150, blank=True)
    plin_number = models.CharField(max_length=20, blank=True)
    plin_holder = models.CharField(max_length=150, blank=True)
    bank_details = models.TextField(blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))])
    free_shipping_minimum = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal("0.00"))])
    low_stock_threshold = models.PositiveIntegerField(default=5)
    checkout_message = models.CharField(max_length=255, default="Coordinaremos el pago y la entrega contigo.")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "configuración de tienda"
        verbose_name_plural = "configuración de tienda"

    @classmethod
    def load(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class Notification(models.Model):
    class Type(models.TextChoices):
        ORDER = "order", "Pedido"
        PAYMENT = "payment", "Pago"
        INVENTORY = "inventory", "Inventario"
        SYSTEM = "system", "Sistema"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=300)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "is_read", "created_at"], name="store_notif_user_read_idx")]
