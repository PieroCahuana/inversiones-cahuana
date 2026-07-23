from decimal import Decimal
from uuid import uuid4

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.products.models import Product


def generate_order_number() -> str:
    code = uuid4().hex[:10].upper()
    return f"IC-{code}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmado"
        PROCESSING = "processing", "En preparación"
        SHIPPED = "shipped", "Enviado"
        DELIVERED = "delivered", "Entregado"
        CANCELLED = "cancelled", "Cancelado"

    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = "bank_transfer", "Transferencia bancaria"
        YAPE = "yape", "Yape"
        PLIN = "plin", "Plin"
        CASH_ON_DELIVERY = "cash_on_delivery", "Pago contra entrega"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"
        FAILED = "failed", "Fallido"
        REFUNDED = "refunded", "Reembolsado"

    order_number = models.CharField(
        max_length=20,
        unique=True,
        default=generate_order_number,
        editable=False,
        verbose_name="número de pedido",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
        verbose_name="cliente",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="estado",
    )
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        verbose_name="método de pago",
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name="estado del pago",
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="subtotal",
    )
    shipping_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="costo de envío",
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    coupon_code = models.CharField(max_length=40, blank=True)
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="total",
    )

    recipient_name = models.CharField(
        max_length=150,
        verbose_name="nombre del destinatario",
    )
    recipient_phone = models.CharField(
        max_length=20,
        verbose_name="teléfono del destinatario",
    )
    department = models.CharField(
        max_length=100,
        verbose_name="departamento",
    )
    province = models.CharField(
        max_length=100,
        verbose_name="provincia",
    )
    district = models.CharField(
        max_length=100,
        verbose_name="distrito",
    )
    address = models.CharField(
        max_length=255,
        verbose_name="dirección",
    )
    address_reference = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="referencia",
    )
    notes = models.TextField(
        blank=True,
        verbose_name="observaciones",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="última actualización",
    )

    class Meta:
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order_number"]),
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["payment_status"]),
        ]

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items.all())

    def __str__(self) -> str:
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="pedido",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="producto",
    )

    # Información histórica del producto.
    product_name = models.CharField(
        max_length=200,
        verbose_name="nombre del producto",
    )
    product_sku = models.CharField(
        max_length=50,
        verbose_name="SKU",
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="precio unitario",
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="cantidad",
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="subtotal",
    )

    class Meta:
        verbose_name = "detalle del pedido"
        verbose_name_plural = "detalles del pedido"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.quantity} × {self.product_name}"


def payment_receipt_upload_to(instance, filename: str) -> str:
    return f"payment_receipts/{instance.order.order_number}/{filename}"


class PaymentReceipt(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente de revisión"
        APPROVED = "approved", "Aprobado"
        REJECTED = "rejected", "Rechazado"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment_receipt")
    file = models.FileField(upload_to=payment_receipt_upload_to)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    customer_note = models.CharField(max_length=255, blank=True)
    review_note = models.CharField(max_length=255, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="reviewed_payment_receipts", null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Comprobante {self.order.order_number}"
