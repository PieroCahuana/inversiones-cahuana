from django.urls import path

from .views import (
    AdminOrderDetailView,
    AdminOrderListView,
    AdminOrderPaymentUpdateView,
    AdminOrderStatusUpdateView,
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
    path(
        "admin/",
        AdminOrderListView.as_view(),
        name="admin-list",
    ),
    path(
        "admin/<str:order_number>/",
        AdminOrderDetailView.as_view(),
        name="admin-detail",
    ),
    path(
        "admin/<str:order_number>/status/",
        AdminOrderStatusUpdateView.as_view(),
        name="admin-status-update",
    ),
    path(
        "admin/<str:order_number>/payment/",
        AdminOrderPaymentUpdateView.as_view(),
        name="admin-payment-update",
    ),
]