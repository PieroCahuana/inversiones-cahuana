from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "role",
        "is_verified",
        "is_staff",
        "is_active",
    )
    list_filter = (
        "role",
        "is_verified",
        "is_staff",
        "is_active",
    )
    search_fields = (
        "email",
        "username",
        "first_name",
        "last_name",
        "phone",
    )
    ordering = ("email",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "Información adicional",
            {
                "fields": (
                    "phone",
                    "role",
                    "is_verified",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )