import type { Order } from "./validate";

export type OrderSections = {
  /** Not picked up, pickup date today or later; soonest first. */
  upcoming: Order[];
  /** Picked up, or pickup date before today; most recent date first. */
  past: Order[];
};

/** Within one pickup date: timed orders first in time order, then untimed (D-013). */
function compareWithinDay(a: Order, b: Order): number {
  if (a.pickup_time !== b.pickup_time) {
    if (a.pickup_time === null) return 1;
    if (b.pickup_time === null) return -1;
    return a.pickup_time < b.pickup_time ? -1 : 1;
  }
  return a.id - b.id;
}

function compareDates(a: Order, b: Order): number {
  return a.pickup_date < b.pickup_date ? -1 : a.pickup_date > b.pickup_date ? 1 : 0;
}

/**
 * Splits orders into the upcoming section and the bottom section.
 * `today` is the laptop's local date as YYYY-MM-DD; a pickup date of today is upcoming (D-013).
 */
export function splitOrders(orders: readonly Order[], today: string): OrderSections {
  const upcoming: Order[] = [];
  const past: Order[] = [];
  for (const order of orders) {
    if (!order.picked_up && order.pickup_date >= today) upcoming.push(order);
    else past.push(order);
  }
  upcoming.sort((a, b) => compareDates(a, b) || compareWithinDay(a, b));
  past.sort((a, b) => compareDates(b, a) || compareWithinDay(a, b));
  return { upcoming, past };
}
