import django_filters

from .models import Order


class OrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(
        field_name="status",
        lookup_expr="iexact",
    )
    payment_status = django_filters.CharFilter(
        field_name="payment_status",
        lookup_expr="iexact",
    )
    payment_method = django_filters.CharFilter(
        field_name="payment_method",
        lookup_expr="iexact",
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
        model = Order
        fields = (
            "status",
            "payment_status",
            "payment_method",
            "created_from",
            "created_to",
        )