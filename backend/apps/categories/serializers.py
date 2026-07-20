from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "image_url",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "image_url",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value: str) -> str:
        name = value.strip()

        if len(name) < 2:
            raise serializers.ValidationError(
                "El nombre debe contener al menos 2 caracteres."
            )

        queryset = Category.objects.filter(name__iexact=name)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe una categoría con este nombre."
            )

        return name

    def get_image_url(self, obj: Category) -> str | None:
        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.image.url)

        return obj.image.url