export type MovementType = "entry" | "exit" | "adjustment" | "return";

export interface InventoryMovement {
  id: number;
  product: { id: number; sku: string; name: string; slug: string };
  movement_type: MovementType;
  movement_type_display: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference: string;
  created_by: { id: number; email: string; full_name: string };
  created_at: string;
}

export interface InventoryMovementPayload {
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  reason: string;
  reference: string;
}
