from django.urls import path

from .views import (
    AdminUserDetailView, AdminUserListView, CurrentUserView, LogoutView,
    PasswordResetConfirmView, PasswordResetRequestView, UserRegisterView,
)

app_name = "users"

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("admin/", AdminUserListView.as_view(), name="admin-list"),
    path("admin/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-detail"),
]
