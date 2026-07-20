from rest_framework import serializers

from apps.brands.models import Brand
from apps.categories.models import Category

from .models import Product, ProductImage

class ProductImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()
    alt_text = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
    )
    is_primary = serializers.BooleanField(
        required=False,
        default=False,
    )
    order = serializers.IntegerField(
        required=False,
        default=0,
        min_value=0,
    )

    def validate_image(self, image):
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        if image.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Solo se permiten imágenes JPG, PNG o WebP."
            )

        max_size = 5 * 1024 * 1024

        if image.size > max_size:
            raise serializers.ValidationError(
                "La imagen no debe superar los 5 MB."
            )

        return image

    def create(self, validated_data):
        product = self.context["product"]

        return ProductImage.objects.create(
            product=product,
            **validated_data,
        )


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = (
            "id",
            "image",
            "image_url",
            "alt_text",
            "is_primary",
            "order",
            "created_at",
        )
        read_only_fields = (
            "id",
            "image_url",
            "created_at",
        )

    def get_image_url(self, obj: ProductImage) -> str | None:
        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.image.url)

        return obj.image.url


class ProductListSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source="brand.name", read_only=True)
    category = serializers.CharField(source="category.name", read_only=True)
    current_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    has_discount = serializers.BooleanField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "slug",
            "short_description",
            "brand",
            "category",
            "price",
            "discount_price",
            "current_price",
            "has_discount",
            "stock",
            "is_in_stock",
            "condition",
            "is_featured",
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


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source="brand",
        write_only=True,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )
    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )
    current_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    has_discount = serializers.BooleanField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "slug",
            "short_description",
            "description",
            "brand",
            "brand_id",
            "category",
            "category_id",
            "price",
            "discount_price",
            "current_price",
            "has_discount",
            "stock",
            "is_in_stock",
            "condition",
            "specifications",
            "is_featured",
            "is_active",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "current_price",
            "has_discount",
            "is_in_stock",
            "created_at",
            "updated_at",
        )

    def validate_sku(self, value: str) -> str:
        sku = value.strip().upper()
        queryset = Product.objects.filter(sku__iexact=sku)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe un producto con este SKU."
            )

        return sku

    def validate_name(self, value: str) -> str:
        name = value.strip()

        if len(name) < 3:
            raise serializers.ValidationError(
                "El nombre debe contener al menos 3 caracteres."
            )

        return name

    def validate(self, attrs: dict) -> dict:
        price = attrs.get(
            "price",
            getattr(self.instance, "price", None),
        )
        discount_price = attrs.get(
            "discount_price",
            getattr(self.instance, "discount_price", None),
        )

        if discount_price and price and discount_price >= price:
            raise serializers.ValidationError(
                {
                    "discount_price": (
                        "El precio de oferta debe ser menor que el precio normal."
                    )
                }
            )

        brand = attrs.get(
            "brand",
            getattr(self.instance, "brand", None),
        )
        category = attrs.get(
            "category",
            getattr(self.instance, "category", None),
        )

        if brand and not brand.is_active:
            raise serializers.ValidationError(
                {"brand_id": "La marca seleccionada está inactiva."}
            )

        if category and not category.is_active:
            raise serializers.ValidationError(
                {"category_id": "La categoría seleccionada está inactiva."}
            )

        return attrs

    def get_brand(self, obj: Product) -> dict:
        return {
            "id": obj.brand.id,
            "name": obj.brand.name,
            "slug": obj.brand.slug,
        }

    def get_category(self, obj: Product) -> dict:
        return {
            "id": obj.category.id,
            "name": obj.category.name,
            "slug": obj.category.slug,
        }