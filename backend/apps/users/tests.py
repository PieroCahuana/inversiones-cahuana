from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.password = "StrongPassword123!"
        self.user = self.user_model.objects.create_user(
            username="cliente",
            email="cliente@example.com",
            password=self.password,
            first_name="Piero",
            last_name="Cahuana",
        )

    def obtain_tokens(self):
        response = self.client.post(
            "/api/auth/token/",
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data

    def test_register_creates_customer_and_generates_username(self):
        response = self.client.post(
            "/api/users/register/",
            {
                "email": "nuevo@example.com",
                "first_name": "Nuevo",
                "last_name": "Cliente",
                "phone": "987654321",
                "password": self.password,
                "password_confirm": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = self.user_model.objects.get(email="nuevo@example.com")
        self.assertEqual(created_user.role, self.user_model.Role.CUSTOMER)
        self.assertEqual(created_user.username, "nuevo")
        self.assertNotIn("password", response.data["user"])

    def test_login_uses_email_and_returns_token_pair(self):
        tokens = self.obtain_tokens()
        self.assertIn("access", tokens)
        self.assertIn("refresh", tokens)

    def test_superuser_receives_admin_role(self):
        superuser = self.user_model.objects.create_superuser(
            username="superadmin",
            email="superadmin@example.com",
            password=self.password,
        )

        self.assertEqual(superuser.role, self.user_model.Role.ADMIN)
        self.assertTrue(superuser.is_verified)
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_current_user_and_profile_update(self):
        tokens = self.obtain_tokens()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        me_response = self.client.get("/api/users/me/")
        update_response = self.client.patch(
            "/api/users/me/",
            {"first_name": "Rubén", "last_name": "Cahuana", "phone": "954107191"},
            format="json",
        )

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], self.user.email)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["user"]["phone"], "954107191")

    def test_refresh_rotates_token(self):
        tokens = self.obtain_tokens()
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotEqual(response.data["refresh"], tokens["refresh"])

    def test_logout_blacklists_refresh_token(self):
        tokens = self.obtain_tokens()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        logout_response = self.client.post(
            "/api/users/logout/",
            {"refresh": tokens["refresh"]},
            format="json",
        )
        refresh_response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_sends_link_and_changes_password(self):
        request_response = self.client.post("/api/users/password-reset/", {"email": self.user.email}, format="json")
        self.assertEqual(request_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        response = self.client.post("/api/users/password-reset/confirm/", {"uid": uid, "token": token, "password": "NewStrongPassword456!", "password_confirm": "NewStrongPassword456!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPassword456!"))

    def test_admin_can_manage_users_and_customer_cannot(self):
        admin = self.user_model.objects.create_user(username="admin", email="admin@example.com", password=self.password, role="admin")
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get("/api/users/admin/").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(admin)
        list_response = self.client.get("/api/users/admin/", {"search": "cliente"})
        update_response = self.client.patch(f"/api/users/admin/{self.user.id}/", {"is_verified": True, "is_active": False}, format="json")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertFalse(self.user.is_active)
