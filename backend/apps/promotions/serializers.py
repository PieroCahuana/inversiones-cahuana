from rest_framework import serializers

from .models import Banner, Coupon, Promotion


class CouponSerializer(serializers.ModelSerializer):
    usage_count = serializers.IntegerField(source="usages.count", read_only=True)
    discount_type_display = serializers.CharField(source="get_discount_type_display", read_only=True)

    class Meta:
        model = Coupon
        fields = "__all__"

    def validate(self, attrs):
        starts = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        discount_type = attrs.get("discount_type", getattr(self.instance, "discount_type", None))
        value = attrs.get("value", getattr(self.instance, "value", None))
        if starts and ends and ends <= starts:
            raise serializers.ValidationError({"ends_at": "La fecha final debe ser posterior al inicio."})
        if discount_type == Coupon.DiscountType.PERCENTAGE and value and value > 100:
            raise serializers.ValidationError({"value": "El porcentaje no puede superar 100%."})
        return attrs


class PromotionSerializer(serializers.ModelSerializer):
    scope_display = serializers.CharField(source="get_scope_display", read_only=True)

    class Meta:
        model = Promotion
        fields = "__all__"

    def validate(self, attrs):
        scope = attrs.get("scope", getattr(self.instance, "scope", Promotion.Scope.ALL))
        starts = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts and ends and ends <= starts:
            raise serializers.ValidationError({"ends_at": "La fecha final debe ser posterior al inicio."})
        required = {Promotion.Scope.CATEGORY: "category", Promotion.Scope.BRAND: "brand", Promotion.Scope.PRODUCT: "product"}
        field = required.get(scope)
        if field and not attrs.get(field, getattr(self.instance, field, None)):
            raise serializers.ValidationError({field: "Selecciona el alcance de la promoción."})
        return attrs


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = "__all__"

    def validate(self, attrs):
        starts = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts and ends and ends <= starts:
            raise serializers.ValidationError({"ends_at": "La fecha final debe ser posterior al inicio."})
        return attrs


class CouponCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=40)


class CommercialMetricsSerializer(serializers.Serializer):
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    average_ticket = serializers.DecimalField(max_digits=14, decimal_places=2)
    paid_orders = serializers.IntegerField()
    orders_total = serializers.IntegerField()
    last_30_days_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    daily_sales = serializers.ListField(child=serializers.DictField())
    top_products = serializers.ListField(child=serializers.DictField())
    top_coupons = serializers.ListField(child=serializers.DictField())
