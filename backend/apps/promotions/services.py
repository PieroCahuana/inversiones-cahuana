from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone

from .models import Coupon, CouponUsage, Promotion


class PromotionService:
    @staticmethod
    def get_price(product) -> Decimal:
        base_price = product.current_price
        now = timezone.now()
        promotions = Promotion.objects.filter(is_active=True, starts_at__lte=now, ends_at__gte=now).filter(
            Q(scope=Promotion.Scope.ALL)
            | Q(scope=Promotion.Scope.PRODUCT, product_id=product.id)
            | Q(scope=Promotion.Scope.BRAND, brand_id=product.brand_id)
            | Q(scope=Promotion.Scope.CATEGORY, category_id=product.category_id)
        )
        best_price = base_price
        for promotion in promotions:
            price = (base_price * (Decimal("100") - promotion.discount_percentage) / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            best_price = min(best_price, price)
        return best_price


class CouponService:
    @staticmethod
    def validate(*, code: str, user, subtotal: Decimal) -> tuple[Coupon, Decimal]:
        now = timezone.now()
        try:
            coupon = Coupon.objects.get(code__iexact=code.strip(), is_active=True, starts_at__lte=now, ends_at__gte=now)
        except Coupon.DoesNotExist:
            raise ValidationError({"coupon_code": "El cupón no existe, está inactivo o venció."})
        if subtotal < coupon.minimum_purchase:
            raise ValidationError({"coupon_code": f"Este cupón requiere una compra mínima de S/ {coupon.minimum_purchase}."})
        if coupon.usage_limit is not None and coupon.usages.count() >= coupon.usage_limit:
            raise ValidationError({"coupon_code": "Este cupón alcanzó su límite de usos."})
        if coupon.usages.filter(user=user).count() >= coupon.usage_limit_per_user:
            raise ValidationError({"coupon_code": "Ya utilizaste este cupón el máximo de veces permitido."})
        discount = coupon.value if coupon.discount_type == Coupon.DiscountType.FIXED else subtotal * coupon.value / Decimal("100")
        if coupon.maximum_discount is not None:
            discount = min(discount, coupon.maximum_discount)
        discount = min(discount, subtotal).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return coupon, discount
