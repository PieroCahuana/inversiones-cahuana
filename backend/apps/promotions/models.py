from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Porcentaje"
        FIXED = "fixed", "Monto fijo"

    code = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    minimum_purchase = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    maximum_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_limit_per_user = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.code


class Promotion(models.Model):
    class Scope(models.TextChoices):
        ALL = "all", "Todo el catálogo"
        CATEGORY = "category", "Categoría"
        BRAND = "brand", "Marca"
        PRODUCT = "product", "Producto"

    name = models.CharField(max_length=150)
    scope = models.CharField(max_length=20, choices=Scope.choices, default=Scope.ALL)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name="promotions")
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, null=True, blank=True, related_name="promotions")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="promotions")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal("0.01")), MaxValueValidator(Decimal("100.00"))])
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    priority = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return self.name


class Banner(models.Model):
    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=255, blank=True)
    image_url = models.URLField()
    button_text = models.CharField(max_length=50, default="Ver ofertas")
    link = models.CharField(max_length=255, default="/products")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.PROTECT, related_name="usages")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="coupon_usages")
    order = models.OneToOneField("orders.Order", on_delete=models.PROTECT, related_name="coupon_usage")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
