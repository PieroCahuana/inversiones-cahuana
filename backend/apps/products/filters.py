import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
    )
    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
    )
    brand = django_filters.CharFilter(
        field_name="brand__slug",
        lookup_expr="iexact",
    )
    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact",
    )
    condition = django_filters.CharFilter(
        field_name="condition",
        lookup_expr="iexact",
    )
    in_stock = django_filters.BooleanFilter(
        method="filter_in_stock",
    )
    featured = django_filters.BooleanFilter(
        field_name="is_featured",
    )

    class Meta:
        model = Product
        fields = (
            "brand",
            "category",
            "condition",
            "in_stock",
            "featured",
            "min_price",
            "max_price",
        )

    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(stock__gt=0)

        if value is False:
            return queryset.filter(stock=0)

        return queryset