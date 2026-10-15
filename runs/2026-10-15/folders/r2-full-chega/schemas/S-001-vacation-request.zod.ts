// GENERATED FROM S-001-vacation-request.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const VacationRequestSchema = z.object({
  id: z.string().min(1),
  requesterEmail: z.string().email(),
  requesterName: z.string().min(1).max(200),
  startDate: z.string().date(),
  endDate: z.string().date(),
  comment: z.string().max(500).optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]),
  decisionReason: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  decidedAt: z.string().datetime().optional(),
}).strict().describe("A stored vacation request with its status. Used by R-003.");
export type VacationRequest = z.infer<typeof VacationRequestSchema>;
