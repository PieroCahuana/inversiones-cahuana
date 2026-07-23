export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function calculateCheckoutTotals(
  subtotal: number,
  configuredShipping: number,
  freeShippingMinimum: number | null,
  couponDiscount = 0,
): CheckoutTotals {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscount = Math.min(Math.max(0, couponDiscount), safeSubtotal);
  const shipping = freeShippingMinimum !== null && safeSubtotal >= freeShippingMinimum
    ? 0
    : Math.max(0, configuredShipping);
  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    shipping,
    total: safeSubtotal - safeDiscount + shipping,
  };
}
