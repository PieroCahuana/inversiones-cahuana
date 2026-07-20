from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, mixins, status, viewsets
from rest_framework.response import Response

from .filters import InventoryMovementFilter
from .models import InventoryMovement
from .permissions import IsInventoryManager
from .serializers import (
    InventoryMovementCreateSerializer,
    InventoryMovementSerializer,
)


@extend_schema_view(
    list=extend_schema(
        description="Lista el historial de movimientos de inventario.",
        tags=["Inventario"],
    ),
    retrieve=extend_schema(
        description="Obtiene el detalle de un movimiento de inventario.",
        tags=["Inventario"],
    ),
    create=extend_schema(
        request=InventoryMovementCreateSerializer,
        responses={201: InventoryMovementSerializer},
        description=(
            "Registra una entrada, salida, ajuste o devolución de inventario."
        ),
        tags=["Inventario"],
    ),
)
class InventoryMovementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsInventoryManager]
    filterset_class = InventoryMovementFilter

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "product__sku",
        "product__name",
        "reason",
        "reference",
        "created_by__email",
    ]

    ordering_fields = [
        "created_at",
        "quantity",
        "previous_stock",
        "new_stock",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            InventoryMovement.objects
            .select_related("product", "created_by")
            .all()
        )

    def get_serializer_class(self):
        if self.action == "create":
            return InventoryMovementCreateSerializer

        return InventoryMovementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        movement = serializer.save()

        response_serializer = InventoryMovementSerializer(
            movement,
            context={"request": request},
        )

        return Response(
            {
                "message": "Movimiento registrado correctamente.",
                "movement": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )