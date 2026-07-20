from django.core.exceptions import ValidationError
from django.db import transaction

from apps.products.models import Product

from .models import InventoryMovement


class InventoryService:
    @staticmethod
    @transaction.atomic
    def register_movement(
        *,
        product_id: int,
        movement_type: str,
        quantity: int,
        reason: str,
        user,
        reference: str = "",
    ) -> InventoryMovement:
        product = (
            Product.objects
            .select_for_update()
            .get(pk=product_id)
        )

        previous_stock = product.stock

        if movement_type == InventoryMovement.MovementType.ENTRY:
            new_stock = previous_stock + quantity

        elif movement_type == InventoryMovement.MovementType.RETURN:
            new_stock = previous_stock + quantity

        elif movement_type == InventoryMovement.MovementType.EXIT:
            if quantity > previous_stock:
                raise ValidationError(
                    {
                        "quantity": (
                            "No existe stock suficiente para realizar la salida."
                        )
                    }
                )

            new_stock = previous_stock - quantity

        elif movement_type == InventoryMovement.MovementType.ADJUSTMENT:
            new_stock = quantity

        else:
            raise ValidationError(
                {"movement_type": "El tipo de movimiento no es válido."}
            )

        product.stock = new_stock
        product.save(update_fields=["stock", "updated_at"])

        movement = InventoryMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason,
            reference=reference,
            created_by=user,
        )

        return movement