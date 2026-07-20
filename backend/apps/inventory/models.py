from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.products.models import Product


class InventoryMovement(models.Model):
    class MovementType(models.TextChoices):
        ENTRY = "entry", "Entrada"
        EXIT = "exit", "Salida"
        ADJUSTMENT = "adjustment", "Ajuste"
        RETURN = "return", "Devolución"

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="inventory_movements",
        verbose_name="producto",
    )
    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices,
        verbose_name="tipo de movimiento",
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="cantidad",
    )
    previous_stock = models.PositiveIntegerField(
        verbose_name="stock anterior",
    )
    new_stock = models.PositiveIntegerField(
        verbose_name="stock resultante",
    )
    reason = models.CharField(
        max_length=255,
        verbose_name="motivo",
    )
    reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="referencia",
        help_text="Ejemplo: compra, pedido, factura o devolución.",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="inventory_movements_created",
        verbose_name="registrado por",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación",
    )

    class Meta:
        verbose_name = "movimiento de inventario"
        verbose_name_plural = "movimientos de inventario"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["product", "created_at"]),
            models.Index(fields=["movement_type"]),
            models.Index(fields=["created_by"]),
        ]

    def __str__(self) -> str:
        return (
            f"{self.get_movement_type_display()} - "
            f"{self.product.sku} - {self.quantity}"
        )