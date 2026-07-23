import { describe, expect, it } from "vitest";
import { calculateCheckoutTotals } from "./checkout-calculations";

describe("calculateCheckoutTotals", () => {
  it("adds configured shipping below the free threshold", () => {
    expect(calculateCheckoutTotals(100, 15, 200, 0)).toEqual({ subtotal: 100, discount: 0, shipping: 15, total: 115 });
  });

  it("makes shipping free when the threshold is reached", () => {
    expect(calculateCheckoutTotals(250, 15, 200, 20)).toEqual({ subtotal: 250, discount: 20, shipping: 0, total: 230 });
  });

  it("never allows discounts or totals below zero", () => {
    expect(calculateCheckoutTotals(50, -10, null, 100)).toEqual({ subtotal: 50, discount: 50, shipping: 0, total: 0 });
  });
});
