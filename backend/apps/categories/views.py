from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets

from .models import Category
from .permissions import IsAdminOrReadOnly
from .serializers import CategorySerializer


@extend_schema_view(
    list=extend_schema(
        description="Lista las categorías activas.",
        tags=["Categorías"],
    ),
    retrieve=extend_schema(
        description="Obtiene el detalle de una categoría.",
        tags=["Categorías"],
    ),
    create=extend_schema(
        description="Crea una categoría. Requiere permisos de administrador.",
        tags=["Categorías"],
    ),
    update=extend_schema(
        description="Actualiza completamente una categoría.",
        tags=["Categorías"],
    ),
    partial_update=extend_schema(
        description="Actualiza parcialmente una categoría.",
        tags=["Categorías"],
    ),
    destroy=extend_schema(
        description="Elimina una categoría.",
        tags=["Categorías"],
    ),
)
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = [
        "name",
        "description",
    ]
    ordering_fields = [
        "name",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]

    def get_queryset(self):
        queryset = Category.objects.all()
        user = self.request.user

        if user.is_authenticated and (
            user.is_superuser
            or user.is_staff
            or getattr(user, "role", None) == "admin"
        ):
            return queryset

        return queryset.filter(is_active=True)