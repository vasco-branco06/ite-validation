import { describe, it, expect } from "vitest";
import { splitOrders } from "../../src/sort";
import type { Order } from "../../src/validate";

const today = "2026-10-16"; // a Friday

let nextId = 1;
function order(customer_name: string, pickup_date: string, pickup_time: string | null = null, picked_up = false): Order {
  return {
    id: nextId++,
    customer_name,
    phone: "912 345 678",
    cake: "Sponge",
    pickup_date,
    pickup_time,
    picked_up,
    created_at: "2026-10-01T09:00:00.000Z",
  };
}
const names = (orders: Order[]) => orders.map((o) => o.customer_name);

describe("T-002 upcoming orders first, past orders below", () => {
  it("lists Friday then Saturday as upcoming and last Monday below", () => {
    const orders = [order("Saturday", "2026-10-24"), order("Friday", "2026-10-23"), order("Last Monday", "2026-10-12")];
    const { upcoming, past } = splitOrders(orders, today);
    expect(names(upcoming)).toEqual(["Friday", "Saturday"]);
    expect(names(past)).toEqual(["Last Monday"]);
  });

  it("puts picked-up orders in the bottom section even when their date is ahead", () => {
    const orders = [order("Waiting", "2026-10-20"), order("Collected early", "2026-10-18", null, true)];
    const { upcoming, past } = splitOrders(orders, today);
    expect(names(upcoming)).toEqual(["Waiting"]);
    expect(names(past)).toEqual(["Collected early"]);
  });

  it("does not change the input array", () => {
    const orders = [order("B", "2026-10-24"), order("A", "2026-10-23")];
    splitOrders(orders, today);
    expect(names(orders)).toEqual(["B", "A"]);
  });
});

describe("T-013 (tripwire D-013) today is upcoming, timed orders first", () => {
  it("lists today 09:00, today 15:00, then today with no time; yesterday is below", () => {
    const orders = [
      order("Today 15:00", today, "15:00"),
      order("Today no time", today),
      order("Today 09:00", today, "09:00"),
      order("Yesterday", "2026-10-15"),
    ];
    const { upcoming, past } = splitOrders(orders, today);
    expect(names(upcoming)).toEqual(["Today 09:00", "Today 15:00", "Today no time"]);
    expect(names(past)).toEqual(["Yesterday"]);
  });

  it("keeps a later day after untimed orders for today", () => {
    const orders = [order("Tomorrow 08:00", "2026-10-17", "08:00"), order("Today no time", today)];
    expect(names(splitOrders(orders, today).upcoming)).toEqual(["Today no time", "Tomorrow 08:00"]);
  });
});
