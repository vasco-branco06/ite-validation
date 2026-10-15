// GENERATED FROM S-003-manager-decision.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const ManagerDecisionSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
}).strict().describe("The manager's approve or reject decision on a pending request. Used by R-010 and R-011.");
export type ManagerDecision = z.infer<typeof ManagerDecisionSchema>;
