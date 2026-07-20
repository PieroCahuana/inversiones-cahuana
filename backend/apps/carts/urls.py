from django.urls import path

from .views import (
    CartClearView,
    CartDetailView,
    CartItemAddView,
    CartItemDetailView,
)


app_name = "carts"

urlpatterns = [
    path(
        "",
        CartDetailView.as_view(),
        name="detail",
    ),
    path(
        "items/",
        CartItemAddView.as_view(),
        name="add-item",
    ),
    path(
        "items/<int:item_id>/",
        CartItemDetailView.as_view(),
        name="item-detail",
    ),
    path(
        "clear/",
        CartClearView.as_view(),
        name="clear",
    ),
]