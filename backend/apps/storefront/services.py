from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction

from .models import Notification


def _send_email(subject: str, message: str, recipient: str) -> None:
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=True)


def notify_user(*, user, notification_type: str, title: str, message: str, link: str = "", email_subject: str = "") -> None:
    def create_and_send():
        Notification.objects.create(user=user, notification_type=notification_type, title=title, message=message, link=link)
        if email_subject and user.email:
            _send_email(email_subject, f"{message}\n\nIngresa a tu cuenta para ver los detalles.", user.email)
    transaction.on_commit(create_and_send)


def notify_admins(*, notification_type: str, title: str, message: str, link: str = "", email_subject: str = "") -> None:
    def create_and_send():
        user_model = get_user_model()
        admins = user_model.objects.filter(is_active=True).filter(role="admin") | user_model.objects.filter(is_active=True, is_superuser=True)
        for admin in admins.distinct():
            Notification.objects.create(user=admin, notification_type=notification_type, title=title, message=message, link=link)
            if email_subject and admin.email:
                _send_email(email_subject, message, admin.email)
    transaction.on_commit(create_and_send)
