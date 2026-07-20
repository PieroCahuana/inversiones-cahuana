from rest_framework import serializers

from .models import Brand


class BrandSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "logo",
            "logo_url",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "logo_url",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value: str) -> str:
        name = value.strip()

        if len(name) < 2:
            raise serializers.ValidationError(
                "El nombre debe contener al menos 2 caracteres."
            )

        queryset = Brand.objects.filter(name__iexact=name)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe una marca con este nombre."
            )

        return name

    def get_logo_url(self, obj: Brand) -> str | None:
        if not obj.logo:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.logo.url)

        return obj.logo.url