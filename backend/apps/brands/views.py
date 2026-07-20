from drf_spectacular.utils import extend_schema_view
from drf_spectacular.utils import extend_schema
from rest_framework import filters, viewsets

from .models import Brand
from .permissions import IsAdminOrReadOnly
from .serializers import BrandSerializer


@extend_schema_view(
    list=extend_schema(
        description="Lista las marcas registradas.",
        tags=["Marcas"],
    ),
    retrieve=extend_schema(
        description="Obtiene el detalle de una marca.",
        tags=["Marcas"],
    ),
    create=extend_schema(
        description="Crea una nueva marca. Requiere permisos de administrador.",
        tags=["Marcas"],
    ),
    update=extend_schema(
        description="Actualiza completamente una marca.",
        tags=["Marcas"],
    ),
    partial_update=extend_schema(
        description="Actualiza parcialmente una marca.",
        tags=["Marcas"],
    ),
    destroy=extend_schema(
        description="Elimina una marca.",
        tags=["Marcas"],
    ),
)
class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = Brand.objects.all()

        if self.request.user.is_authenticated and (
            self.request.user.is_staff
            or self.request.user.is_superuser
            or getattr(self.request.user, "role", None) == "admin"
        ):
            return queryset

        return queryset.filter(is_active=True)