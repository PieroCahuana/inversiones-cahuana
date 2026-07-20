from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    UserProfileUpdateSerializer,
    UserRegisterSerializer,
    UserSerializer,
)


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