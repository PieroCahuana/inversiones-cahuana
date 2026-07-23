import { describe, expect, it } from "vitest";
import { activeOrderSteps, orderStatusClasses, paymentStatusClasses } from "./order-status";

describe("order status configuration", () => {
  it("keeps the customer tracking sequence in operational order", () => {
    expect(activeOrderSteps).toEqual(["pending", "confirmed", "processing", "shipped", "delivered"]);
  });

  it("provides a visual class for every terminal state", () => {
    expect(orderStatusClasses.cancelled).toContain("red");
    expect(paymentStatusClasses.refunded).toContain("slate");
  });
});
