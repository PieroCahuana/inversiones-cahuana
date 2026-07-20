from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Administrador"
        CUSTOMER = "customer", "Cliente"
        SELLER = "seller", "Vendedor"

    email = models.EmailField(
        unique=True,
        verbose_name="correo electrónico",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="teléfono",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        verbose_name="rol",
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name="verificado",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="última actualización",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email