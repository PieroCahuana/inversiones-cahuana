from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .filters import ProductFilter
from .models import Product, ProductImage
from .permissions import IsAdminOrReadOnly
from .serializers import (
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductImageUploadSerializer,
    ProductListSerializer,
)


@extend_schema_view(
    list=extend_schema(
        description="Lista los productos activos del catálogo.",
        tags=["Productos"],
    ),
    retrieve=extend_schema(
        description="Obtiene el detalle completo de un producto.",
        tags=["Productos"],
    ),
    create=extend_schema(
        description="Crea un producto. Requiere permisos de administrador.",
        tags=["Productos"],
    ),
    update=extend_schema(
        description="Actualiza completamente un producto.",
        tags=["Productos"],
    ),
    partial_update=extend_schema(
        description="Actualiza parcialmente un producto.",
        tags=["Productos"],
    ),
    destroy=extend_schema(
        description="Elimina un producto.",
        tags=["Productos"],
    ),
)
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filterset_class = ProductFilter

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "sku",
        "short_description",
        "description",
        "brand__name",
        "category__name",
    ]

    ordering_fields = [
        "name",
        "price",
        "stock",
        "created_at",
        "updated_at",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = (
            Product.objects
            .select_related("brand", "category")
            .prefetch_related("images")
            .all()
        )

        user = self.request.user

        if user.is_authenticated and (
            user.is_superuser
            or user.is_staff
            or getattr(user, "role", None) == "admin"
        ):
            return queryset

        return queryset.filter(
            is_active=True,
            brand__is_active=True,
            category__is_active=True,
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer

        return ProductDetailSerializer

    @extend_schema(
    request=ProductImageUploadSerializer,
    responses={201: ProductImageSerializer},
    description="Agrega una imagen a un producto.",
    tags=["Productos"],
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="images",
        parser_classes=[MultiPartParser, FormParser],
    )
    def add_image(self, request, slug=None):
        product = self.get_object()

        serializer = ProductImageUploadSerializer(
            data=request.data,
            context={
                "request": request,
                "product": product,
            },
        )
        serializer.is_valid(raise_exception=True)
        image = serializer.save()

        response_serializer = ProductImageSerializer(
            image,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        responses={204: None},
        description="Elimina una imagen de un producto.",
        tags=["Productos"],
    )
    @action(
        detail=True,
        methods=["delete"],
        url_path=r"images/(?P<image_id>\d+)",
    )
    def delete_image(self, request, slug=None, image_id=None):
        product = self.get_object()

        try:
            image = product.images.get(pk=image_id)
        except ProductImage.DoesNotExist:
            return Response(
                {"detail": "La imagen no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        image.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
