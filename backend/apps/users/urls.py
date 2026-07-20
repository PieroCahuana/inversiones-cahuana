from django.urls import path

from .views import CurrentUserView, UserRegisterView

app_name = "users"

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]