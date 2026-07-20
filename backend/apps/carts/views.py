from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CartItem
from .permissions import IsCustomer
from .serializers import (
    CartItemAddSerializer,
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
)
from .services import CartService


class CartDetailView(APIView):
    permission_classes = [IsCustomer]

    @extend_schema(
        responses={200: CartSerializer},
        description="Devuelve el carrito del usuario autenticado.",
        tags=["Carrito"],
    )
    def get(self, request):
        cart = CartService.get_or_create_cart(request.user)

        cart = (
            cart.__class__.objects
            .prefetch_related(
                "items__product__brand",
                "items__product__category",
                "items__product__images",
            )
            .get(pk=cart.pk)
        )

        serializer = CartSerializer(
            cart,
            context={"request": request},
        )
        return Response(serializer.data)


class CartItemAddView(APIView):
    permission_classes = [IsCustomer]

    @extend_schema(
        request=CartItemAddSerializer,
        responses={201: CartItemSerializer},
        description="Agrega un producto al carrito.",
        tags=["Carrito"],
    )
    def post(self, request):
        serializer = CartItemAddSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        item = serializer.save()

        return Response(
            {
                "message": "Producto agregado al carrito.",
                "item": CartItemSerializer(
                    item,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(APIView):
    permission_classes = [IsCustomer]

    def get_item(self, user, item_id: int) -> CartItem:
        return get_object_or_404(
            CartItem.objects.select_related(
                "product",
                "product__brand",
                "product__category",
            ).prefetch_related("product__images"),
            pk=item_id,
            cart__user=user,
        )

    @extend_schema(
        request=CartItemUpdateSerializer,
        responses={200: CartItemSerializer},
        description="Modifica la cantidad de un producto del carrito.",
        tags=["Carrito"],
    )
    def patch(self, request, item_id: int):
        item = self.get_item(request.user, item_id)

        serializer = CartItemUpdateSerializer(
            item,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        updated_item = serializer.save()

        return Response(
            {
                "message": "Cantidad actualizada correctamente.",
                "item": CartItemSerializer(
                    updated_item,
                    context={"request": request},
                ).data,
            }
        )

    @extend_schema(
        responses={204: None},
        description="Elimina un producto del carrito.",
        tags=["Carrito"],
    )
    def delete(self, request, item_id: int):
        self.get_item(request.user, item_id)

        CartService.remove_item(
            user=request.user,
            item_id=item_id,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class CartClearView(APIView):
    permission_classes = [IsCustomer]

    @extend_schema(
        responses={204: None},
        description="Elimina todos los productos del carrito.",
        tags=["Carrito"],
    )
    def delete(self, request):
        CartService.clear_cart(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)