from django.core.exceptions import ValidationError
from django.db import transaction

from apps.products.models import Product

from .models import Cart, CartItem


class CartService:
    @staticmethod
    def get_or_create_cart(user) -> Cart:
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    @staticmethod
    @transaction.atomic
    def add_product(
        *,
        user,
        product_id: int,
        quantity: int,
    ) -> CartItem:
        product = (
            Product.objects
            .select_for_update()
            .select_related("brand", "category")
            .get(pk=product_id)
        )

        if not product.is_active:
            raise ValidationError(
                {"product_id": "El producto no está disponible."}
            )

        if not product.brand.is_active:
            raise ValidationError(
                {"product_id": "La marca del producto está inactiva."}
            )

        if not product.category.is_active:
            raise ValidationError(
                {"product_id": "La categoría del producto está inactiva."}
            )

        cart = CartService.get_or_create_cart(user)

        item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        requested_quantity = (
            quantity if created else item.quantity + quantity
        )

        if requested_quantity > product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Solo hay {product.stock} unidades disponibles."
                    )
                }
            )

        if not created:
            item.quantity = requested_quantity
            item.save(update_fields=["quantity", "updated_at"])

        return item

    @staticmethod
    @transaction.atomic
    def update_quantity(
        *,
        user,
        item_id: int,
        quantity: int,
    ) -> CartItem:
        item = (
            CartItem.objects
            .select_for_update()
            .select_related("cart", "product")
            .get(
                pk=item_id,
                cart__user=user,
            )
        )

        if quantity > item.product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Solo hay {item.product.stock} unidades disponibles."
                    )
                }
            )

        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])

        return item

    @staticmethod
    @transaction.atomic
    def remove_item(*, user, item_id: int) -> None:
        item = CartItem.objects.select_for_update().get(
            pk=item_id,
            cart__user=user,
        )
        item.delete()

    @staticmethod
    @transaction.atomic
    def clear_cart(*, user) -> None:
        cart = CartService.get_or_create_cart(user)
        cart.items.all().delete()