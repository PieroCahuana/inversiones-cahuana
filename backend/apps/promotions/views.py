from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Avg, Count, F, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.carts.models import Cart
from apps.orders.models import Order, OrderItem
from apps.storefront.permissions import IsStoreAdmin

from .models import Banner, Coupon, CouponUsage, Promotion
from .serializers import BannerSerializer, CommercialMetricsSerializer, CouponCodeSerializer, CouponSerializer, PromotionSerializer
from .services import CouponService


class AdminModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStoreAdmin]
    pagination_class = None


class CouponViewSet(AdminModelViewSet):
    queryset = Coupon.objects.prefetch_related("usages").all()
    serializer_class = CouponSerializer


class PromotionViewSet(AdminModelViewSet):
    queryset = Promotion.objects.select_related("category", "brand", "product").all()
    serializer_class = PromotionSerializer


class BannerViewSet(AdminModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path="active")
    def active(self, request):
        now = timezone.now()
        queryset = self.get_queryset().filter(is_active=True, starts_at__lte=now, ends_at__gte=now)
        return Response(self.get_serializer(queryset, many=True).data)


class CouponValidateView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CouponCodeSerializer

    def post(self, request):
        code = str(request.data.get("code", "")).strip()
        try:
            cart = Cart.objects.prefetch_related("items__product").get(user=request.user)
            coupon, discount = CouponService.validate(code=code, user=request.user, subtotal=cart.subtotal)
        except Cart.DoesNotExist:
            return Response({"detail": "Tu carrito está vacío."}, status=status.HTTP_400_BAD_REQUEST)
        except DjangoValidationError as exc:
            return Response(exc.message_dict if hasattr(exc, "message_dict") else {"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"code": coupon.code, "description": coupon.description, "discount_amount": str(discount), "subtotal_after_discount": str(cart.subtotal - discount)})


class CommercialMetricsView(APIView):
    permission_classes = [IsStoreAdmin]
    serializer_class = CommercialMetricsSerializer

    def get(self, request):
        since = timezone.now() - timedelta(days=30)
        orders = Order.objects.exclude(status=Order.Status.CANCELLED)
        paid = orders.filter(payment_status=Order.PaymentStatus.PAID)
        summary = paid.aggregate(revenue=Sum("total"), average_ticket=Avg("total"), paid_orders=Count("id"))
        recent = paid.filter(created_at__gte=since)
        daily = recent.annotate(day=TruncDate("created_at")).values("day").annotate(total=Sum("total"), orders=Count("id")).order_by("day")
        top_products = OrderItem.objects.filter(order__in=paid).values("product_name", "product_sku").annotate(quantity=Sum("quantity"), revenue=Sum(F("quantity") * F("unit_price"))).order_by("-quantity")[:8]
        coupons = CouponUsage.objects.values("coupon__code").annotate(uses=Count("id"), discount=Sum("discount_amount")).order_by("-uses")[:8]
        return Response({
            "revenue": str(summary["revenue"] or Decimal("0.00")),
            "average_ticket": str(summary["average_ticket"] or Decimal("0.00")),
            "paid_orders": summary["paid_orders"] or 0,
            "orders_total": orders.count(),
            "last_30_days_revenue": str(recent.aggregate(value=Sum("total"))["value"] or Decimal("0.00")),
            "daily_sales": [{"day": row["day"], "total": str(row["total"]), "orders": row["orders"]} for row in daily],
            "top_products": list(top_products),
            "top_coupons": list(coupons),
        })
