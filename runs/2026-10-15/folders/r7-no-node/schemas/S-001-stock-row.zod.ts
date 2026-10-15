// GENERATED FROM S-001-stock-row.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const StockRowSchema = z.object({
  product: z.string().min(1).describe("Product name, column A"),
  quantity: z.number().describe("Units in stock now, column B"),
  minimum: z.number().min(0).describe("Alert threshold, column C"),
}).strict().describe("One product row in the Stock tab. Used by R-001.");
export type StockRow = z.infer<typeof StockRowSchema>;
