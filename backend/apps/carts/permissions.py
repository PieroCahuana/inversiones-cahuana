from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    message = "Solo los clientes autenticados pueden usar el carrito."

    def has_permission(self, request, view) -> bool:
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
        )