// GENERATED FROM S-001-error-event.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const ErrorEventSchema = z.object({
  file: z.string().min(1).describe("Log file name inside LOG_DIR."),
  line_number: z.number().int().min(1),
  level: z.enum(["ERROR", "FATAL", "CRITICAL"]),
  message: z.string().min(1).max(4000),
  stack: z.string().max(8000).describe("Stack-trace lines after the error line, empty when none.").optional(),
  log_timestamp: z.string().describe("Timestamp text as written in the log, if any.").optional(),
  seen_at: z.string().datetime().describe("When the agent read the line."),
}).strict().describe("One error line with its following stack-trace lines, read from a log file. Used by R-002.");
export type ErrorEvent = z.infer<typeof ErrorEventSchema>;
