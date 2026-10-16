// GENERATED FROM S-002-order.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const OrderSchema = z.object({
  id: z.number().int().min(1).describe("Database row id"),
  customer_name: z.string().min(1).regex(new RegExp("\\S")),
  phone: z.string().regex(new RegExp("^[0-9 +]*[0-9][0-9 +]*$")),
  cake: z.string().min(1).regex(new RegExp("\\S")),
  pickup_date: z.string().date(),
  pickup_time: z.string().regex(new RegExp("^([01][0-9]|2[0-3]):[0-5][0-9]$")).nullable(),
  picked_up: z.boolean().describe("True after Picked up is clicked"),
  created_at: z.string().datetime(),
}).strict().describe("A stored order as the list shows it. Used by R-003.");
export type Order = z.infer<typeof OrderSchema>;
