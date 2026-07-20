from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = (
        "product",
        "quantity",
        "created_at",
        "updated_at",
    )
    can_delete = False

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "total_items",
        "subtotal",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    readonly_fields = (
        "user",
        "created_at",
        "updated_at",
    )
    inlines = [CartItemInline]

    def has_add_permission(self, request) -> bool:
        return False


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = (
        "cart",
        "product",
        "quantity",
        "unit_price",
        "subtotal",
        "created_at",
    )
    search_fields = (
        "cart__user__email",
        "product__sku",
        "product__name",
    )
    readonly_fields = (
        "cart",
        "product",
        "quantity",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False