from rest_framework import serializers

from .models import Notification, StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = ("business_name", "phone", "whatsapp", "address", "opening_hours", "support_text", "facebook_url", "yape_number", "yape_holder", "plin_number", "plin_holder", "bank_details", "shipping_cost", "free_shipping_minimum", "low_stock_threshold", "checkout_message", "updated_at")
        read_only_fields = ("updated_at",)


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source="get_notification_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "notification_type", "notification_type_display", "title", "message", "link", "is_read", "created_at")
        read_only_fields = fields
