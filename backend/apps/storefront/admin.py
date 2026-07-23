from django.contrib import admin

from .models import Notification, StoreSettings


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    fieldsets = (("Negocio", {"fields": ("business_name", "phone", "whatsapp", "address", "opening_hours", "support_text", "facebook_url")}), ("Pagos y envíos", {"fields": ("yape_number", "yape_holder", "plin_number", "plin_holder", "bank_details", "shipping_cost", "free_shipping_minimum", "low_stock_threshold", "checkout_message")}))

    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "notification_type", "is_read", "created_at")
    list_filter = ("notification_type", "is_read", "created_at")
    search_fields = ("title", "message", "user__email")
