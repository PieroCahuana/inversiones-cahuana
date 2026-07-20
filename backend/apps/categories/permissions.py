from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    message = "Solo los administradores pueden modificar las categorías."

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.is_staff
                or getattr(request.user, "role", None) == "admin"
            )
        )