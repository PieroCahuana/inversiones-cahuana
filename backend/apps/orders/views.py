from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import filters, status
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.views import APIView

from .filters import OrderFilter
from .models import Order, PaymentReceipt
from .permissions import IsActiveUser, IsOrderAdmin
from .services import OrderManagementService
from .serializers import (
    CheckoutSerializer,
    OrderListSerializer,
    OrderPaymentStatusUpdateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    PaymentReceiptReviewSerializer,
    PaymentReceiptSerializer,
    PaymentReceiptUploadSerializer,
)
from apps.storefront.models import Notification
from apps.storefront.services import notify_admins, notify_user


class CheckoutView(APIView):
    permission_classes = [IsActiveUser]

    @extend_schema(
        request=CheckoutSerializer,
        responses={201: OrderSerializer},
        description=(
            "Convierte el carrito del usuario autenticado en un pedido."
        ),
        tags=["Pedidos"],
    )
    def post(self, request):
        serializer = CheckoutSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        order = (
            Order.objects
            .prefetch_related("items__product")
            .get(pk=order.pk)
        )

        return Response(
            {
                "message": "Pedido creado correctamente.",
                "order": OrderSerializer(
                    order,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderListView(APIView):
    permission_classes = [IsActiveUser]

    @extend_schema(
        responses={200: OrderListSerializer(many=True)},
        description="Lista los pedidos del usuario autenticado.",
        tags=["Pedidos"],
    )
    def get(self, request):
        queryset = (
            Order.objects
            .filter(user=request.user)
            .select_related("user")
            .prefetch_related("items")
            .order_by("-created_at")
        )

        filterset = OrderFilter(
            request.GET,
            queryset=queryset,
        )

        if not filterset.is_valid():
            return Response(
                filterset.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = filterset.qs

        search = request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                order_number__icontains=search
            )

        ordering = request.query_params.get(
            "ordering",
            "-created_at",
        )

        allowed_ordering = {
            "created_at",
            "-created_at",
            "total",
            "-total",
        }

        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        serializer = OrderListSerializer(
            queryset,
            many=True,
        )
        return Response(serializer.data)


class OrderDetailView(APIView):
    permission_classes = [IsActiveUser]

    @extend_schema(
        responses={200: OrderSerializer},
        description="Obtiene el detalle de un pedido del usuario.",
        tags=["Pedidos"],
    )
    def get(self, request, order_number: str):
        try:
            order = (
                Order.objects
                .prefetch_related("items__product")
                .get(
                    order_number=order_number,
                    user=request.user,
                )
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "El pedido no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderSerializer(
            order,
            context={"request": request},
        )
        return Response(serializer.data)
    

class AdminOrderListView(APIView):
    permission_classes = [IsOrderAdmin]

    @extend_schema(
        responses={200: OrderListSerializer(many=True)},
        description="Lista todos los pedidos para administración.",
        tags=["Administración de pedidos"],
    )
    def get(self, request):
        queryset = (
            Order.objects
            .select_related("user")
            .prefetch_related("items")
            .all()
            .order_by("-created_at")
        )

        filterset = OrderFilter(
            request.GET,
            queryset=queryset,
        )

        if not filterset.is_valid():
            return Response(
                filterset.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = filterset.qs

        search = request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                order_number__icontains=search
            )

        serializer = OrderListSerializer(
            queryset,
            many=True,
        )
        return Response(serializer.data)


class AdminOrderDetailView(APIView):
    permission_classes = [IsOrderAdmin]

    def get_order(self, order_number: str) -> Order:
        try:
            return (
                Order.objects
                .select_related("user")
                .prefetch_related("items__product")
                .get(order_number=order_number)
            )
        except Order.DoesNotExist:
            return None

    @extend_schema(
        responses={200: OrderSerializer},
        description="Obtiene el detalle administrativo de un pedido.",
        tags=["Administración de pedidos"],
    )
    def get(self, request, order_number: str):
        order = self.get_order(order_number)

        if not order:
            return Response(
                {"detail": "El pedido no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            OrderSerializer(
                order,
                context={"request": request},
            ).data
        )


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsOrderAdmin]

    @extend_schema(
        request=OrderStatusUpdateSerializer,
        responses={200: OrderSerializer},
        description=(
            "Actualiza el estado de un pedido. "
            "La cancelación devuelve automáticamente el stock."
        ),
        tags=["Administración de pedidos"],
    )
    def patch(self, request, order_number: str):
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.only("id").get(
                order_number=order_number
            )

            updated_order = OrderManagementService.update_status(
                order_id=order.id,
                new_status=serializer.validated_data["status"],
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "El pedido no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                return Response(
                    exc.message_dict,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_order = (
            Order.objects
            .prefetch_related("items__product")
            .get(pk=updated_order.pk)
        )

        return Response(
            {
                "message": "Estado del pedido actualizado correctamente.",
                "order": OrderSerializer(
                    updated_order,
                    context={"request": request},
                ).data,
            }
        )


class AdminOrderPaymentUpdateView(APIView):
    permission_classes = [IsOrderAdmin]

    @extend_schema(
        request=OrderPaymentStatusUpdateSerializer,
        responses={200: OrderSerializer},
        description="Actualiza el estado del pago de un pedido.",
        tags=["Administración de pedidos"],
    )
    def patch(self, request, order_number: str):
        serializer = OrderPaymentStatusUpdateSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.only("id").get(
                order_number=order_number
            )

            updated_order = OrderManagementService.update_payment_status(
                order_id=order.id,
                new_payment_status=serializer.validated_data[
                    "payment_status"
                ],
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "El pedido no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                return Response(
                    exc.message_dict,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_order = (
            Order.objects
            .prefetch_related("items__product")
            .get(pk=updated_order.pk)
        )

        return Response(
            {
                "message": "Estado del pago actualizado correctamente.",
                "order": OrderSerializer(
                    updated_order,
                    context={"request": request},
                ).data,
            }
        )


class PaymentReceiptView(APIView):
    permission_classes = [IsActiveUser]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = PaymentReceiptSerializer

    def get_order(self, request, order_number: str):
        try:
            return Order.objects.select_related("user").get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return None

    def get(self, request, order_number: str):
        order = self.get_order(request, order_number)
        if not order:
            return Response({"detail": "El pedido no existe."}, status=status.HTTP_404_NOT_FOUND)
        try:
            receipt = order.payment_receipt
        except PaymentReceipt.DoesNotExist:
            return Response({"detail": "Este pedido aún no tiene comprobante."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PaymentReceiptSerializer(receipt, context={"request": request}).data)

    def post(self, request, order_number: str):
        order = self.get_order(request, order_number)
        if not order:
            return Response({"detail": "El pedido no existe."}, status=status.HTTP_404_NOT_FOUND)
        if order.payment_method == Order.PaymentMethod.CASH_ON_DELIVERY:
            return Response({"detail": "Los pedidos contra entrega no requieren comprobante."}, status=status.HTTP_400_BAD_REQUEST)
        if order.payment_status == Order.PaymentStatus.PAID:
            return Response({"detail": "El pago de este pedido ya fue aprobado."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PaymentReceiptUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        receipt, created = PaymentReceipt.objects.get_or_create(
            order=order,
            defaults={"file": serializer.validated_data["file"], "customer_note": serializer.validated_data["customer_note"]},
        )
        if not created:
            receipt.file = serializer.validated_data["file"]
            receipt.customer_note = serializer.validated_data["customer_note"]
            receipt.status = PaymentReceipt.Status.PENDING
            receipt.review_note = ""
            receipt.reviewed_by = None
            receipt.reviewed_at = None
            receipt.save()
        if order.payment_status == Order.PaymentStatus.FAILED:
            order.payment_status = Order.PaymentStatus.PENDING
            order.save(update_fields=["payment_status", "updated_at"])
        notify_admins(
            notification_type=Notification.Type.PAYMENT,
            title="Comprobante por revisar",
            message=f"El pedido {order.order_number} tiene un nuevo comprobante.",
            link=f"/admin/orders/{order.order_number}",
            email_subject=f"Comprobante recibido - {order.order_number}",
        )
        return Response({"message": "Comprobante enviado para revisión.", "receipt": PaymentReceiptSerializer(receipt, context={"request": request}).data}, status=status.HTTP_201_CREATED)


class AdminPaymentReceiptReviewView(APIView):
    permission_classes = [IsOrderAdmin]
    serializer_class = PaymentReceiptReviewSerializer

    def patch(self, request, order_number: str):
        try:
            receipt = PaymentReceipt.objects.select_related("order").get(order__order_number=order_number)
        except PaymentReceipt.DoesNotExist:
            return Response({"detail": "El pedido no tiene comprobante."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PaymentReceiptReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        receipt.status = serializer.validated_data["status"]
        receipt.review_note = serializer.validated_data["review_note"]
        receipt.reviewed_by = request.user
        receipt.reviewed_at = timezone.now()
        receipt.save()
        receipt.order.payment_status = Order.PaymentStatus.PAID if receipt.status == PaymentReceipt.Status.APPROVED else Order.PaymentStatus.FAILED
        receipt.order.save(update_fields=["payment_status", "updated_at"])
        notify_user(
            user=receipt.order.user,
            notification_type=Notification.Type.PAYMENT,
            title="Comprobante revisado",
            message=f"Tu comprobante del pedido {receipt.order.order_number} fue {receipt.get_status_display().lower()}.",
            link=f"/orders/{receipt.order.order_number}",
            email_subject=f"Comprobante revisado - {receipt.order.order_number}",
        )
        return Response({"message": "Comprobante revisado correctamente.", "receipt": PaymentReceiptSerializer(receipt, context={"request": request}).data})
