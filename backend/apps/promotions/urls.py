from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BannerViewSet, CommercialMetricsView, CouponValidateView, CouponViewSet, PromotionViewSet

router = DefaultRouter()
router.register("coupons", CouponViewSet, basename="coupon")
router.register("promotions", PromotionViewSet, basename="promotion")
router.register("banners", BannerViewSet, basename="banner")

urlpatterns = [
    path("", include(router.urls)),
    path("coupon/validate/", CouponValidateView.as_view(), name="coupon-validate"),
    path("metrics/", CommercialMetricsView.as_view(), name="metrics"),
]
