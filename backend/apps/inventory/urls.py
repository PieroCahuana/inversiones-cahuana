from rest_framework.routers import DefaultRouter

from .views import InventoryMovementViewSet


router = DefaultRouter()
router.register(
    "movements",
    InventoryMovementViewSet,
    basename="inventory-movement",
)

urlpatterns = router.urls