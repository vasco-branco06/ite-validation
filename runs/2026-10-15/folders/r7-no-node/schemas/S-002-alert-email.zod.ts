// GENERATED FROM S-002-alert-email.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const LowProductSchema = z.object({
  row: z.number().int().min(2),
  product: z.string().min(1),
  quantity: z.number(),
  minimum: z.number().min(0),
}).strict();
export type LowProduct = z.infer<typeof LowProductSchema>;

export const ProblemRowSchema = z.object({
  row: z.number().int().min(2),
  product: z.string(),
  problem: z.enum(["quantity_invalid", "minimum_invalid", "duplicate_product"]),
}).strict();
export type ProblemRow = z.infer<typeof ProblemRowSchema>;

export const AlertEmailSchema = z.object({
  to: z.string().email(),
  date: z.string().date(),
  low_products: z.array(LowProductSchema),
  problem_rows: z.array(ProblemRowSchema),
}).strict().describe("Content of one daily alert email. Used by R-004.");
export type AlertEmail = z.infer<typeof AlertEmailSchema>;
