from rest_framework.permissions import BasePermission


class IsUserAdmin(BasePermission):
    message = "Solo los administradores pueden gestionar usuarios."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                user.is_superuser
                or user.is_staff
                or getattr(user, "role", None) == "admin"
            )
        )
