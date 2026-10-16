// GENERATED FROM S-001-order-input.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const OrderInputSchema = z.object({
  customer_name: z.string().min(1).regex(new RegExp("\\S")).describe("Customer name; not blank"),
  phone: z.string().regex(new RegExp("^[0-9 +]*[0-9][0-9 +]*$")).describe("Digits, spaces and + only, at least one digit"),
  cake: z.string().min(1).regex(new RegExp("\\S")).describe("Free text: which cake, size, message"),
  pickup_date: z.string().date().describe("Pickup date, YYYY-MM-DD; not before today"),
  pickup_time: z.string().regex(new RegExp("^([01][0-9]|2[0-3]):[0-5][0-9]$")).nullable().describe("Optional pickup time, HH:MM").optional(),
}).strict().describe("What the order form sends when an order is created or edited. Used by R-002.");
export type OrderInput = z.infer<typeof OrderInputSchema>;
