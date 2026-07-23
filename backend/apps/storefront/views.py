from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, StoreSettings
from .permissions import IsStoreAdmin
from .serializers import NotificationSerializer, StoreSettingsSerializer


class PublicStoreSettingsView(APIView):
    permission_classes = [AllowAny]
    serializer_class = StoreSettingsSerializer

    def get(self, request):
        return Response(StoreSettingsSerializer(StoreSettings.load()).data)


class AdminStoreSettingsView(APIView):
    permission_classes = [IsStoreAdmin]
    serializer_class = StoreSettingsSerializer

    def get(self, request):
        return Response(StoreSettingsSerializer(StoreSettings.load()).data)

    def patch(self, request):
        serializer = StoreSettingsSerializer(StoreSettings.load(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Configuración actualizada correctamente.", "settings": serializer.data})


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get(self, request):
        queryset = Notification.objects.filter(user=request.user)[:50]
        return Response({"unread_count": Notification.objects.filter(user=request.user, is_read=False).count(), "results": NotificationSerializer(queryset, many=True).data})


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def patch(self, request, notification_id: int):
        updated = Notification.objects.filter(pk=notification_id, user=request.user).update(is_read=True)
        if not updated:
            return Response({"detail": "La notificación no existe."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"message": "Notificación marcada como leída."})


class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def patch(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Notificaciones marcadas como leídas."})
