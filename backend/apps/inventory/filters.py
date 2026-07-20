import django_filters

from .models import InventoryMovement


class InventoryMovementFilter(django_filters.FilterSet):
    product = django_filters.CharFilter(
        field_name="product__slug",
        lookup_expr="iexact",
    )
    sku = django_filters.CharFilter(
        field_name="product__sku",
        lookup_expr="iexact",
    )
    movement_type = django_filters.CharFilter(
        field_name="movement_type",
        lookup_expr="iexact",
    )
    created_by = django_filters.NumberFilter(
        field_name="created_by_id",
    )
    created_from = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )
    created_to = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )

    class Meta:
        model = InventoryMovement
        fields = (
            "product",
            "sku",
            "movement_type",
            "created_by",
            "created_from",
            "created_to",
        )