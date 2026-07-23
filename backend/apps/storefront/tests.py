from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notification, StoreSettings


class StorefrontAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.customer = user_model.objects.create_user(username="cliente-store", email="store@example.com", password="StrongPassword123!")
        self.admin = user_model.objects.create_user(username="admin-store", email="admin-store@example.com", password="StrongPassword123!", role="admin")

    def test_public_settings_are_available_without_authentication(self):
        response = self.client.get("/api/store/settings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["business_name"], "Inversiones Cahuana")

    def test_health_check_reports_database_availability(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok", "database": "available"})

    def test_only_admin_can_update_store_settings(self):
        self.client.force_authenticate(self.customer)
        denied = self.client.patch("/api/store/settings/admin/", {"shipping_cost": "15.00"}, format="json")
        self.client.force_authenticate(self.admin)
        allowed = self.client.patch("/api/store/settings/admin/", {"shipping_cost": "15.00", "whatsapp": "51999999999"}, format="json")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
        self.assertEqual(StoreSettings.load().shipping_cost.__str__(), "15.00")

    def test_notifications_are_private_and_can_be_marked_read(self):
        own = Notification.objects.create(user=self.customer, title="Pedido listo", message="Tu pedido está listo", notification_type="order")
        Notification.objects.create(user=self.admin, title="Otra", message="No visible")
        self.client.force_authenticate(self.customer)
        response = self.client.get("/api/store/notifications/")
        read_response = self.client.patch(f"/api/store/notifications/{own.id}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        own.refresh_from_db()
        self.assertTrue(own.is_read)
