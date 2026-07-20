from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = (
        "image",
        "alt_text",
        "is_primary",
        "order",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "name",
        "brand",
        "category",
        "price",
        "discount_price",
        "stock",
        "condition",
        "is_featured",
        "is_active",
    )
    list_filter = (
        "brand",
        "category",
        "condition",
        "is_featured",
        "is_active",
        "created_at",
    )
    search_fields = (
        "sku",
        "name",
        "description",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    prepopulated_fields = {
        "slug": ("name",),
    }
    autocomplete_fields = (
        "brand",
        "category",
    )
    ordering = ("-created_at",)
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "is_primary",
        "order",
        "created_at",
    )
    list_filter = (
        "is_primary",
        "created_at",
    )
    search_fields = (
        "product__name",
        "product__sku",
        "alt_text",
    )