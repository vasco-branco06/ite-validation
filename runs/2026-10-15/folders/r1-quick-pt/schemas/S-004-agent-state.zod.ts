// GENERATED FROM S-004-agent-state.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const FileOffsetSchema = z.object({
  file: z.string().min(1),
  offset: z.number().int().min(0).describe("Byte position read up to."),
}).strict();
export type FileOffset = z.infer<typeof FileOffsetSchema>;

export const KnownErrorSchema = z.object({
  fingerprint: z.string().regex(new RegExp("^[a-z0-9-]{3,80}$")),
  jira_key: z.string().regex(new RegExp("^[A-Z][A-Z0-9]{1,9}-[0-9]+$")),
  created_at: z.string().datetime(),
}).strict();
export type KnownError = z.infer<typeof KnownErrorSchema>;

export const QueuedTicketSchema = z.object({
  fingerprint: z.string().regex(new RegExp("^[a-z0-9-]{3,80}$")),
  attempts: z.number().int().min(0).max(3),
  last_error: z.string().optional(),
  payload_json: z.string().min(2).describe("The S-003 ticket, serialised as JSON."),
}).strict();
export type QueuedTicket = z.infer<typeof QueuedTicketSchema>;

export const AgentStateSchema = z.object({
  offsets: z.array(FileOffsetSchema),
  known: z.array(KnownErrorSchema),
  queue: z.array(QueuedTicketSchema),
}).strict().describe("The local state file kept between runs: read positions, fingerprints that already have a ticket, and the retry queue. Used by R-001, R-007, R-008.");
export type AgentState = z.infer<typeof AgentStateSchema>;
