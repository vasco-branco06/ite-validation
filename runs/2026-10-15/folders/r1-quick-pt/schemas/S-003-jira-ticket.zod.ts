// GENERATED FROM S-003-jira-ticket.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import { z } from "zod";

export const JiraTicketSchema = z.object({
  project_key: z.string().regex(new RegExp("^[A-Z][A-Z0-9]{1,9}$")),
  issue_type: z.enum(["Bug"]),
  title: z.string().min(5).max(120),
  summary: z.string().min(10).max(1000),
  log_excerpt: z.string().min(1).max(2000),
  first_seen: z.string().datetime(),
  occurrences: z.number().int().min(1),
  priority: z.enum(["Highest", "High", "Medium", "Low"]),
  fingerprint: z.string().regex(new RegExp("^[a-z0-9-]{3,80}$")).describe("Also added to the issue as a label."),
}).strict().describe("The ticket the agent sends to Jira as a new Bug. Used by R-004.");
export type JiraTicket = z.infer<typeof JiraTicketSchema>;
