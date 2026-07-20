from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="nombre",
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
    )
    description = models.TextField(
        blank=True,
        verbose_name="descripción",
    )
    logo = models.ImageField(
        upload_to="brands/logos/",
        blank=True,
        null=True,
        verbose_name="logotipo",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="activa",
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
        verbose_name = "marca"
        verbose_name_plural = "marcas"
        ordering = ["name"]

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Brand.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name