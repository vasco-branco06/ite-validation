# DECISIONS - Log-to-Jira Agent

## Decisions

### D-008 Success measure: one ticket per new error within 15 minutes, no duplicates

- **Decision:** Every new error in the logs produces a Jira ticket within 15 minutes, with no duplicate tickets for the same error.
- **Why:** The user accepted ITE's recommended success measure.
  > ok
- **Alternatives considered:** None raised.
- **Affects:** R-004, R-005, R-006, R-007

### D-009 Users: the support team

- **Decision:** The tickets are read and handled by the support team, 2 to 3 people who already use Jira every day.
- **Why:** The user accepted the recommendation; it fixes the Jira project, the permissions and the tone of ticket titles.
  > ok
- **Alternatives considered:** None raised.
- **Affects:** R-004

### D-010 v1 scope: read logs and create tickets only

- **Decision:** v1 reads error logs and creates Jira tickets. It does not fix errors, does not close or edit existing tickets, and does not send Slack or email alerts.
- **Why:** The user accepted the recommendation to keep v1 small and safe.
  > ok
- **Alternatives considered:** None raised.
- **Affects:** R-013

### D-011 Input: plain-text log files in a server folder, every 10 minutes

- **Decision:** The input is plain-text error log files in a folder on the server, read every 10 minutes, up to about 50 MB per day.
- **Why:** The user accepted the recommendation; a 10-minute cycle keeps every new error under the 15-minute target.
  > ok
- **Alternatives considered:** None raised.
- **Affects:** R-001, R-005, R-015

### D-012 Ticket content

- **Decision:** One Jira Bug per distinct error in the support project, with a short title, a summary, a log excerpt, the date and time, the occurrence count and a suggested priority.
- **Why:** The user accepted the recommendation; the support team gets everything they need without opening the logs.
  > ok
- **Alternatives considered:** None raised.
- **Affects:** R-004, R-006

## Assumptions

### D-001 Jira connection and outage behaviour

- **Assumption:** The agent connects to the Jira Cloud REST API with an API token. When Jira is down, tickets wait in a local queue and are retried at most 3 times with growing intervals, then an alert is written to the agent log.
- **Why it matters:** If Jira is on-premise or the queue is lost, tickets disappear during an outage.
- **If wrong:** Switch to the Jira Data Center API or a persistent external queue, and update R-008.
- **Tripwire:** T-001

### D-002 Create-only access and secrets in .env

- **Assumption:** The agent has read-only access to the log folder and create-only use of Jira issues in the support project. The Jira token and the LLM API key live in `.env`, never in code or logs.
- **Why it matters:** An agent that can edit or delete tickets, or leaks a token, can damage the support team's work.
- **If wrong:** Restrict the Jira account permissions further or move secrets to a secret manager.
- **Tripwire:** T-002

### D-003 Stack: Python script on a schedule

- **Assumption:** A Python 3.12 script, run every 10 minutes by cron (or Windows Task Scheduler) on the same server as the logs.
- **Why it matters:** If the server cannot run Python or a scheduler, the 15-minute target fails.
- **If wrong:** Run it as a container or a hosted job that mounts the log folder.
- **Tripwire:** T-003

### D-004 LLM step with Claude Haiku 5.5 and a fallback

- **Assumption:** One LLM step (Claude Haiku 5.5, `claude-haiku-5-5`) groups new error lines into distinct errors and writes a title, summary and suggested priority as JSON (S-002). If it fails, a plain ticket is created from the log line with priority Medium.
- **Why it matters:** Without a fallback, an LLM outage would silently drop tickets.
- **If wrong:** Use a rule-based title and priority only, and drop P-001.
- **Tripwire:** T-004

### D-005 Named failure cases

- **Assumption:** The failure cases are: Jira down, wrong Jira credentials, empty or missing log file, the same error repeated, LLM failure or bad output, and unreadable lines. Each has the behaviour listed in SPEC section 11.
- **Why it matters:** A missing failure case means lost or duplicated tickets.
- **If wrong:** Add the new case to SPEC section 11 with its own test.
- **Tripwire:** T-005

### D-006 Acceptance tests from the interview

- **Assumption:** One Given/When/Then per requirement and per failure case, plus one end-to-end happy path against a Jira test project, is enough to accept v1.
- **Why it matters:** If no Jira test project exists, the end-to-end test cannot run without touching real tickets.
- **If wrong:** Run the end-to-end test against a mocked Jira and add a manual check on the real project.
- **Tripwire:** T-006

### D-007 Definition of done

- **Assumption:** v1 is done when all acceptance tests pass, every new error gives one ticket within 15 minutes with no duplicates, and the support team ran it on last week's logs and the tickets looked right.
- **Why it matters:** Without the manual check, tickets can be technically correct but useless to the team.
- **If wrong:** Agree a different hand check with the support team.
- **Tripwire:** T-007

### D-013 Local state file for offsets, fingerprints and queue

- **Assumption:** The agent keeps a local JSON state file (S-004) with the read position of each log file, the fingerprint of every error that already has a ticket, and the queue of tickets waiting for Jira. This is what makes "no duplicates" hold across runs.
- **Why it matters:** Without it, every run would re-read old lines and open duplicate tickets.
- **If wrong:** Search Jira for an open ticket with the same fingerprint label before creating one.
- **Tripwire:** T-008

### D-014 What counts as an error line

- **Assumption:** An error line is a line whose level is ERROR, FATAL or CRITICAL (any case), together with the stack-trace lines that follow it. INFO, DEBUG and WARN lines are ignored.
- **Why it matters:** If the logs use another format, real errors are missed or warnings flood Jira.
- **If wrong:** Make the level pattern configurable and agree it with the support team.
- **Tripwire:** T-010
