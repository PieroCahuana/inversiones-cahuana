from django.contrib import admin

from .models import Order, OrderItem, PaymentReceipt


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False

    readonly_fields = (
        "product",
        "product_name",
        "product_sku",
        "unit_price",
        "quantity",
        "subtotal",
    )

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "payment_method",
        "payment_status",
        "total",
        "created_at",
    )
    list_filter = (
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    )
    search_fields = (
        "order_number",
        "user__email",
        "recipient_name",
        "recipient_phone",
    )
    readonly_fields = (
        "order_number",
        "user",
        "subtotal",
        "shipping_cost",
        "total",
        "recipient_name",
        "recipient_phone",
        "department",
        "province",
        "district",
        "address",
        "address_reference",
        "notes",
        "created_at",
        "updated_at",
    )
    ordering = ("-created_at",)
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "product_sku",
        "product_name",
        "unit_price",
        "quantity",
        "subtotal",
    )
    search_fields = (
        "order__order_number",
        "product_sku",
        "product_name",
    )
    readonly_fields = (
        "order",
        "product",
        "product_name",
        "product_sku",
        "unit_price",
        "quantity",
        "subtotal",
    )

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False


@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "reviewed_by", "updated_at")
    list_filter = ("status", "updated_at")
    search_fields = ("order__order_number", "order__user__email")
    readonly_fields = ("order", "file", "customer_note", "created_at", "updated_at")
