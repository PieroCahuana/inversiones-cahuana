from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.products.models import Product

from .models import InventoryMovement
from .services import InventoryService


class InventoryMovementSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    movement_type_display = serializers.CharField(
        source="get_movement_type_display",
        read_only=True,
    )

    class Meta:
        model = InventoryMovement
        fields = (
            "id",
            "product",
            "movement_type",
            "movement_type_display",
            "quantity",
            "previous_stock",
            "new_stock",
            "reason",
            "reference",
            "created_by",
            "created_at",
        )
        read_only_fields = fields

    def get_product(self, obj: InventoryMovement) -> dict:
        return {
            "id": obj.product.id,
            "sku": obj.product.sku,
            "name": obj.product.name,
            "slug": obj.product.slug,
        }

    def get_created_by(self, obj: InventoryMovement) -> dict:
        return {
            "id": obj.created_by.id,
            "email": obj.created_by.email,
            "full_name": obj.created_by.get_full_name(),
        }


class InventoryMovementCreateSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
    )
    movement_type = serializers.ChoiceField(
        choices=InventoryMovement.MovementType.choices,
    )
    quantity = serializers.IntegerField(
        min_value=1,
    )
    reason = serializers.CharField(
        max_length=255,
    )
    reference = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_reason(self, value: str) -> str:
        reason = value.strip()

        if len(reason) < 3:
            raise serializers.ValidationError(
                "El motivo debe contener al menos 3 caracteres."
            )

        return reason

    def create(self, validated_data):
        product = validated_data.pop("product")
        request = self.context["request"]

        try:
            return InventoryService.register_movement(
                product_id=product.id,
                movement_type=validated_data["movement_type"],
                quantity=validated_data["quantity"],
                reason=validated_data["reason"],
                reference=validated_data.get("reference", ""),
                user=request.user,
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)

            raise serializers.ValidationError(
                {"detail": exc.messages}
            )