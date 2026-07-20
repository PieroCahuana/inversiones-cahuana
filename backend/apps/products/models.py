from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify

from apps.brands.models import Brand
from apps.categories.models import Category


class Product(models.Model):
    class Condition(models.TextChoices):
        NEW = "new", "Nuevo"
        REFURBISHED = "refurbished", "Reacondicionado"
        USED = "used", "Usado"

    sku = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="SKU",
    )
    name = models.CharField(
        max_length=200,
        verbose_name="nombre",
    )
    slug = models.SlugField(
        max_length=230,
        unique=True,
        blank=True,
    )
    short_description = models.CharField(
        max_length=300,
        blank=True,
        verbose_name="descripción corta",
    )
    description = models.TextField(
        verbose_name="descripción",
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="marca",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="categoría",
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="precio",
    )
    discount_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="precio de oferta",
    )
    stock = models.PositiveIntegerField(
        default=0,
        verbose_name="stock",
    )

    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.NEW,
        verbose_name="condición",
    )

    specifications = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="especificaciones técnicas",
    )

    is_featured = models.BooleanField(
        default=False,
        verbose_name="destacado",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="activo",
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
        verbose_name = "producto"
        verbose_name_plural = "productos"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["sku"]),
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["brand", "category"]),
        ]

    def save(self, *args, **kwargs) -> None:
        self.sku = self.sku.strip().upper()

        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    @property
    def current_price(self) -> Decimal:
        return self.discount_price or self.price

    @property
    def has_discount(self) -> bool:
        return bool(
            self.discount_price
            and self.discount_price < self.price
        )

    @property
    def is_in_stock(self) -> bool:
        return self.stock > 0

    def __str__(self) -> str:
        return f"{self.sku} - {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="producto",
    )
    image = models.ImageField(
        upload_to="products/images/",
        verbose_name="imagen",
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="texto alternativo",
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name="imagen principal",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="orden",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación",
    )

    class Meta:
        verbose_name = "imagen de producto"
        verbose_name_plural = "imágenes de productos"
        ordering = ["order", "id"]

    def save(self, *args, **kwargs) -> None:
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True,
            ).exclude(pk=self.pk).update(is_primary=False)

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Imagen de {self.product.name}"