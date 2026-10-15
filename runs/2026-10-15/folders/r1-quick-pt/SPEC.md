# SPEC - Log-to-Jira Agent

## 1. Problem

Errors written to the server's log files go unnoticed until someone opens the logs. The support team needs each new error to appear as a Jira ticket they can act on, without reading logs by hand.

## 2. Goal and success measure

An agent that reads error logs and opens Jira tickets for the errors it finds.

Success measure: every new error in the logs produces a Jira ticket within 15 minutes, with no duplicate tickets for the same error (D-008).

## 3. Users

The support team: 2 to 3 people who already use Jira every day and handle the tickets. Technical level: comfortable with Jira, not software engineers. They read tickets daily; the agent itself runs unattended every 10 minutes (D-009).

## 4. Scope

### In scope

- Read plain-text error log files from a folder on the server every 10 minutes.
- Find error lines and group them into distinct errors.
- Create one Jira Bug per new distinct error in the support project.

### Out of scope

- Fixing the errors.
- Closing, editing or deleting existing Jira tickets.
- Sending alerts by Slack or email.

### Later

Nothing planned.

## 5. Requirements

- **R-001** Each run reads only the lines added to the log files in the configured folder since the previous run. → T-009
- **R-002** Each run selects lines with level ERROR, FATAL or CRITICAL, plus their stack-trace lines, as error events (S-001). → T-010
- **R-003** The agent groups the error events of a run into distinct errors and gives each a title, summary, suggested priority and fingerprint using P-001 (S-002). → T-014
- **R-004** For each new distinct error, the agent creates one Jira Bug in the support project with title, summary, log excerpt, first-seen time, occurrence count and priority (S-003). → T-006
- **R-005** A new error produces its Jira ticket within 15 minutes of being written to the log. → T-006
- **R-006** Repeats of the same error within one run produce one ticket whose occurrence count equals the number of repeats. → T-005
- **R-007** An error that already has a ticket from an earlier run produces no new ticket (S-004). → T-008
- **R-008** When Jira is unreachable or answers with a 5xx status, the ticket is kept in the local queue and retried at most 3 times, then an alert is written to the agent log. → T-001
- **R-009** When Jira rejects the credentials, the agent stops creating tickets for that run, keeps the queue, writes an alert and does not retry. → T-011
- **R-010** An empty or missing log file is skipped without error and creates no ticket. → T-012
- **R-011** An unreadable or binary line is skipped and counted in the run summary. → T-013
- **R-012** When P-001 fails or returns output that does not match S-002, the agent creates a fallback ticket titled from the raw log line with priority Medium. → T-004
- **R-013** The agent only creates Jira issues; it never edits, closes or deletes them. → T-002
- **R-014** Secrets are read only from environment variables or `.env` and never appear in code or in the agent log. → T-002
- **R-015** One run over 50 MB of new log lines finishes within 5 minutes. → T-003
- **R-016** P-001 returns different errors as separate items. → T-015

## 6. Data

- [S-001](schemas/S-001-error-event.schema.json) One error line with its stack trace, read from a log file. Used by R-002.
- [S-002](schemas/S-002-error-analysis.schema.json) The LLM's grouping of error events into distinct errors. Used by R-003, R-012.
- [S-003](schemas/S-003-jira-ticket.schema.json) The ticket sent to Jira. Used by R-004.
- [S-004](schemas/S-004-agent-state.schema.json) The local state file: read positions, known fingerprints and the retry queue. Used by R-001, R-007, R-008.

## 7. Integrations

- **Jira Cloud** (outbound, create-only): REST API `POST /rest/api/3/issue`, authenticated with an account email and API token from `.env`. When down: queue and retry 3 times, then alert (D-001).
- **Anthropic API** (outbound): Claude Haiku 5.5 for P-001, authenticated with an API key from `.env`. When down: fallback ticket (D-004).
- **Log folder** (inbound, read-only): local file system path from `.env`.

## 8. Permissions and security

- Reads: log files in the configured folder (read-only).
- Writes: new Jira issues in the support project; the local state file and the agent log.
- Never: edits, closes or deletes Jira issues; writes to the log folder.
- Secrets: `JIRA_EMAIL`, `JIRA_API_TOKEN`, `ANTHROPIC_API_KEY` live in `.env`, which is in `.gitignore`. Non-secret settings: `JIRA_BASE_URL`, `JIRA_PROJECT_KEY`, `LOG_DIR`, `STATE_FILE`.
- Log excerpts sent to Jira and to the LLM may contain personal data from the logs; the support team already has access to these logs (D-002).

## 9. Stack

Python 3.12, run every 10 minutes by cron or Windows Task Scheduler on the log server (D-003). Libraries: `httpx` (Jira REST), `anthropic` (LLM), `pydantic` v2 (schemas), `python-dotenv` (settings). Test runner: `pytest`, with `respx` to mock HTTP. Prompt tests: promptfoo.

## 10. LLM use

- [P-001](prompts/P-001-analyse-errors.md) Groups a run's error events into distinct errors with title, summary, priority and fingerprint. Used by R-003, R-012, R-016. Model: `claude-haiku-5-5` (D-004).

## 11. Errors and edge cases

| Case | Expected behaviour | Test |
|---|---|---|
| Jira down or 5xx | Keep the ticket in the queue, retry at most 3 times, then alert in the agent log; no ticket lost | T-001 |
| Wrong Jira credentials (401/403) | Stop creating tickets for the run, keep the queue, alert, no retries | T-011 |
| Empty or missing log file | Skip silently, no ticket | T-012 |
| Same error repeated | One ticket with the occurrence count | T-005 |
| LLM fails or returns bad output | Fallback ticket from the raw log line, priority Medium | T-004 |
| Unreadable or binary line | Skip the line and count it in the run summary | T-013 |

## 12. Definition of done

- All tests in [tests/acceptance.md](tests/acceptance.md) pass.
- Every new error produces one ticket within 15 minutes, with no duplicates.
- The support team ran the agent on last week's logs and the tickets looked right (T-007, D-007).
