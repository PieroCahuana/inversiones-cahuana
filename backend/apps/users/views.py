from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Count, Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    AdminUserSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserProfileUpdateSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .permissions import IsUserAdmin

User = get_user_model()


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={204: None},
        description="Cierra la sesión e invalida el refresh token.",
        tags=["Usuarios"],
    )
    def post(self, request: Request) -> Response:
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            return Response(
                {"detail": "El token de renovación no es válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=UserRegisterSerializer,
        responses={201: UserSerializer},
        description="Registra una nueva cuenta de cliente.",
        tags=["Usuarios"],
    )
    def post(self, request: Request) -> Response:
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_serializer = UserSerializer(user)

        return Response(
            {
                "message": "Usuario registrado correctamente.",
                "user": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer},
        description="Devuelve la información del usuario autenticado.",
        tags=["Usuarios"],
    )
    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        request=UserProfileUpdateSerializer,
        responses={200: UserSerializer},
        description="Actualiza parcialmente el perfil del usuario autenticado.",
        tags=["Usuarios"],
    )
    def patch(self, request: Request) -> Response:
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Perfil actualizado correctamente.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request: Request) -> Response:
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            send_mail(
                subject="Restablece tu contraseña - Inversiones Cahuana",
                message=(
                    f"Hola {user.first_name or 'cliente'},\n\n"
                    "Recibimos una solicitud para restablecer tu contraseña. "
                    f"Ingresa al siguiente enlace:\n{reset_url}\n\n"
                    "Si no realizaste esta solicitud, ignora este mensaje."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response({"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request: Request) -> Response:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if not user or not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"detail": "El enlace no es válido o ya expiró."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password", "updated_at"])
        return Response({"message": "Contraseña actualizada correctamente."})


class AdminUserListView(APIView):
    permission_classes = [IsUserAdmin]
    serializer_class = AdminUserSerializer

    def get(self, request: Request) -> Response:
        queryset = User.objects.annotate(orders_count=Count("orders")).order_by("-created_at")
        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "").strip()
        active = request.query_params.get("is_active")
        if search:
            queryset = queryset.filter(Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(phone__icontains=search))
        if role in User.Role.values:
            queryset = queryset.filter(role=role)
        if active in {"true", "false"}:
            queryset = queryset.filter(is_active=active == "true")
        return Response(AdminUserSerializer(queryset, many=True).data)


class AdminUserDetailView(APIView):
    permission_classes = [IsUserAdmin]
    serializer_class = AdminUserSerializer

    def patch(self, request: Request, user_id: int) -> Response:
        try:
            user = User.objects.annotate(orders_count=Count("orders")).get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "El usuario no existe."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserSerializer(user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = User.objects.annotate(orders_count=Count("orders")).get(pk=user.pk)
        return Response({"message": "Usuario actualizado correctamente.", "user": AdminUserSerializer(user).data})
