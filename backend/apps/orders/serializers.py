from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Order, OrderItem
from .services import OrderService


class OrderItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product_name",
            "product_sku",
            "product_slug",
            "unit_price",
            "quantity",
            "subtotal",
        )
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    payment_method_display = serializers.CharField(
        source="get_payment_method_display",
        read_only=True,
    )
    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True,
    )
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "status_display",
            "payment_method",
            "payment_method_display",
            "payment_status",
            "payment_status_display",
            "subtotal",
            "shipping_cost",
            "total",
            "total_items",
            "recipient_name",
            "recipient_phone",
            "department",
            "province",
            "district",
            "address",
            "address_reference",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class OrderListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True,
    )
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "total_items",
            "total",
            "created_at",
        )


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
    )
    recipient_name = serializers.CharField(
        max_length=150,
    )
    recipient_phone = serializers.CharField(
        max_length=20,
    )
    department = serializers.CharField(
        max_length=100,
    )
    province = serializers.CharField(
        max_length=100,
    )
    district = serializers.CharField(
        max_length=100,
    )
    address = serializers.CharField(
        max_length=255,
    )
    address_reference = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default="",
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_recipient_name(self, value: str) -> str:
        name = value.strip()

        if len(name) < 3:
            raise serializers.ValidationError(
                "El nombre debe contener al menos 3 caracteres."
            )

        return name

    def validate_recipient_phone(self, value: str) -> str:
        phone = value.strip()

        if not phone.isdigit():
            raise serializers.ValidationError(
                "El teléfono solo debe contener números."
            )

        if len(phone) != 9:
            raise serializers.ValidationError(
                "El teléfono debe contener 9 dígitos."
            )

        return phone

    def validate_address(self, value: str) -> str:
        address = value.strip()

        if len(address) < 8:
            raise serializers.ValidationError(
                "La dirección debe contener al menos 8 caracteres."
            )

        return address

    def create(self, validated_data):
        request = self.context["request"]

        try:
            return OrderService.checkout(
                user=request.user,
                **validated_data,
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(
                    exc.message_dict
                )

            raise serializers.ValidationError(
                {"detail": exc.messages}
            )