// GENERATED FROM S-002-new-vacation-request.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const NewVacationRequestSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  comment: z.string().max(500).optional(),
}).strict().describe("The form a team member submits to request vacation. Used by R-003.");
export type NewVacationRequest = z.infer<typeof NewVacationRequestSchema>;
