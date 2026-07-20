from django.urls import path

from .views import (
    CheckoutView,
    OrderDetailView,
    OrderListView,
)


app_name = "orders"

urlpatterns = [
    path(
        "",
        OrderListView.as_view(),
        name="list",
    ),
    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout",
    ),
    path(
        "<str:order_number>/",
        OrderDetailView.as_view(),
        name="detail",
    ),
]