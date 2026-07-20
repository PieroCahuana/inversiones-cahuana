from django.contrib import admin

from .models import Brand


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "is_active",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "is_active",
        "created_at",
    )
    search_fields = (
        "name",
        "description",
    )
    prepopulated_fields = {
        "slug": ("name",),
    }
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    ordering = ("name",)