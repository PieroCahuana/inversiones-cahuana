from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.products.models import Product

from .models import Cart, CartItem
from .services import CartService


class CartProductSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(
        source="brand.name",
        read_only=True,
    )
    category = serializers.CharField(
        source="category.name",
        read_only=True,
    )
    current_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "slug",
            "brand",
            "category",
            "current_price",
            "stock",
            "primary_image",
        )

    def get_primary_image(self, obj: Product) -> str | None:
        image = obj.images.filter(is_primary=True).first()

        if not image:
            image = obj.images.first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(image.image.url)

        return image.image.url


class CartItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)
    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    subtotal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "quantity",
            "unit_price",
            "subtotal",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Cart
        fields = (
            "id",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CartItemAddSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
    )
    quantity = serializers.IntegerField(
        min_value=1,
        max_value=100,
        default=1,
    )

    def create(self, validated_data):
        request = self.context["request"]
        product = validated_data["product"]

        try:
            return CartService.add_product(
                user=request.user,
                product_id=product.id,
                quantity=validated_data["quantity"],
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)

            raise serializers.ValidationError(
                {"detail": exc.messages}
            )


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(
        min_value=1,
        max_value=100,
    )

    def update(self, instance, validated_data):
        request = self.context["request"]

        try:
            return CartService.update_quantity(
                user=request.user,
                item_id=instance.id,
                quantity=validated_data["quantity"],
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)

            raise serializers.ValidationError(
                {"detail": exc.messages}
            )