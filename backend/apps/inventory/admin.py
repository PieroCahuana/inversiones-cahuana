from django.contrib import admin

from .models import InventoryMovement


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "movement_type",
        "quantity",
        "previous_stock",
        "new_stock",
        "created_by",
        "created_at",
    )
    list_filter = (
        "movement_type",
        "created_at",
        "product__brand",
        "product__category",
    )
    search_fields = (
        "product__sku",
        "product__name",
        "reason",
        "reference",
        "created_by__email",
    )
    readonly_fields = (
        "product",
        "movement_type",
        "quantity",
        "previous_stock",
        "new_stock",
        "reason",
        "reference",
        "created_by",
        "created_at",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False