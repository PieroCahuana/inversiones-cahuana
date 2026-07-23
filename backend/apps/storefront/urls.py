from django.urls import path

from .views import AdminStoreSettingsView, NotificationListView, NotificationReadAllView, NotificationReadView, PublicStoreSettingsView

urlpatterns = [
    path("settings/", PublicStoreSettingsView.as_view(), name="public-settings"),
    path("settings/admin/", AdminStoreSettingsView.as_view(), name="admin-settings"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path("notifications/read-all/", NotificationReadAllView.as_view(), name="notifications-read-all"),
    path("notifications/<int:notification_id>/read/", NotificationReadView.as_view(), name="notification-read"),
]
