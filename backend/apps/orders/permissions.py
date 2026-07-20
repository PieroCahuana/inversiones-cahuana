from rest_framework.permissions import BasePermission


class IsActiveUser(BasePermission):
    message = "Debes tener una cuenta activa para gestionar pedidos."

    def has_permission(self, request, view) -> bool:
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
        )