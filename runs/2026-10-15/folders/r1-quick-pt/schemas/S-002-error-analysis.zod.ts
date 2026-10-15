// GENERATED FROM S-002-error-analysis.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const DistinctErrorSchema = z.object({
  fingerprint: z.string().regex(new RegExp("^[a-z0-9-]{3,80}$")).describe("Stable kebab-case key for the error, without numbers that change between occurrences."),
  title: z.string().min(5).max(120),
  summary: z.string().min(10).max(1000),
  priority: z.enum(["Highest", "High", "Medium", "Low"]),
  event_indexes: z.array(z.number().int().min(0)).min(1).describe("Positions of the input events that belong to this error."),
}).strict();
export type DistinctError = z.infer<typeof DistinctErrorSchema>;

export const ErrorAnalysisSchema = z.object({
  errors: z.array(DistinctErrorSchema),
}).strict().describe("The output of P-001: a run's error events grouped into distinct errors. Used by R-003, R-012.");
export type ErrorAnalysis = z.infer<typeof ErrorAnalysisSchema>;
