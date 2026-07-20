from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction

from apps.carts.models import Cart, CartItem
from apps.inventory.models import InventoryMovement
from apps.products.models import Product

from .models import Order, OrderItem


class OrderService:
    @staticmethod
    @transaction.atomic
    def checkout(
        *,
        user,
        payment_method: str,
        recipient_name: str,
        recipient_phone: str,
        department: str,
        province: str,
        district: str,
        address: str,
        address_reference: str = "",
        notes: str = "",
    ) -> Order:
        try:
            cart = Cart.objects.select_for_update().get(user=user)
        except Cart.DoesNotExist:
            raise ValidationError(
                {"cart": "No existe un carrito para este usuario."}
            )

        cart_items = list(
            CartItem.objects
            .select_related("product")
            .filter(cart=cart)
            .order_by("product_id")
        )

        if not cart_items:
            raise ValidationError(
                {"cart": "El carrito está vacío."}
            )

        product_ids = sorted({
            item.product_id
            for item in cart_items
        })

        locked_products = {
            product.id: product
            for product in (
                Product.objects
                .select_for_update()
                .select_related("brand", "category")
                .filter(id__in=product_ids)
                .order_by("id")
            )
        }

        subtotal = Decimal("0.00")
        prepared_items = []

        for cart_item in cart_items:
            product = locked_products.get(cart_item.product_id)

            if product is None:
                raise ValidationError(
                    {
                        "product": (
                            f"El producto con ID {cart_item.product_id} "
                            "ya no existe."
                        )
                    }
                )

            if not product.is_active:
                raise ValidationError(
                    {
                        "product": (
                            f"El producto {product.name} no está disponible."
                        )
                    }
                )

            if not product.brand.is_active:
                raise ValidationError(
                    {
                        "product": (
                            f"La marca de {product.name} está inactiva."
                        )
                    }
                )

            if not product.category.is_active:
                raise ValidationError(
                    {
                        "product": (
                            f"La categoría de {product.name} está inactiva."
                        )
                    }
                )

            if cart_item.quantity > product.stock:
                raise ValidationError(
                    {
                        "stock": (
                            f"Stock insuficiente para {product.name}. "
                            f"Disponible: {product.stock}; "
                            f"solicitado: {cart_item.quantity}."
                        )
                    }
                )

            unit_price = product.current_price
            item_subtotal = unit_price * cart_item.quantity
            subtotal += item_subtotal

            prepared_items.append(
                {
                    "cart_item": cart_item,
                    "product": product,
                    "unit_price": unit_price,
                    "subtotal": item_subtotal,
                }
            )

        # Por ahora dejamos el envío gratuito.
        shipping_cost = Decimal("0.00")
        total = subtotal + shipping_cost

        order = Order.objects.create(
            user=user,
            payment_method=payment_method,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            recipient_name=recipient_name,
            recipient_phone=recipient_phone,
            department=department,
            province=province,
            district=district,
            address=address,
            address_reference=address_reference,
            notes=notes,
        )

        order_items = []

        for prepared_item in prepared_items:
            cart_item = prepared_item["cart_item"]
            product = prepared_item["product"]
            unit_price = prepared_item["unit_price"]
            item_subtotal = prepared_item["subtotal"]

            previous_stock = product.stock
            new_stock = previous_stock - cart_item.quantity

            product.stock = new_stock
            product.save(
                update_fields=[
                    "stock",
                    "updated_at",
                ]
            )

            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_sku=product.sku,
                    unit_price=unit_price,
                    quantity=cart_item.quantity,
                    subtotal=item_subtotal,
                )
            )

            InventoryMovement.objects.create(
                product=product,
                movement_type=InventoryMovement.MovementType.EXIT,
                quantity=cart_item.quantity,
                previous_stock=previous_stock,
                new_stock=new_stock,
                reason="Venta generada mediante checkout",
                reference=order.order_number,
                created_by=user,
            )

        OrderItem.objects.bulk_create(order_items)

        cart.items.all().delete()

        return order