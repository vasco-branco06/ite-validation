# Acceptance tests - Log-to-Jira Agent

Every test below also exists in [cases.json](cases.json) with the same ID. `Proves` lists the requirements and assumptions each test covers. Assumption tests are tripwires (see [CLAUDE.md](../CLAUDE.md)).

### T-001 Jira outage loses no ticket and retries at most 3 times

Proves: R-008, D-001 · Kind: integration

- Given a new error in the log and a mocked Jira that answers 503 to every request
- When the agent runs four times
- Then the ticket stays in the queue in the state file, Jira receives at most 3 create attempts, and the agent log has one alert after the third failure

### T-002 Create-only Jira access and no secrets in code or logs

Proves: R-013, R-014, D-002 · Kind: integration

- Given the agent's code, the `.env` values and a full run against a mocked Jira
- When the code and the agent log are searched for the token and key values, and all HTTP calls to Jira are recorded
- Then no secret value is found, every Jira call is `POST /rest/api/3/issue`, and `.env` is listed in `.gitignore`

### T-003 A 50 MB log is processed within 5 minutes

Proves: R-015, D-003 · Kind: integration

- Given 50 MB of new log lines and mocked Jira and LLM services
- When the scheduler starts one run
- Then the run finishes in under 5 minutes

### T-004 LLM failure still creates a ticket

Proves: R-012, D-004 · Kind: unit

- Given a new error event and an LLM that returns text that is not valid S-002 JSON
- When the agent runs
- Then one ticket is created with a title taken from the raw log line and priority Medium

### T-005 A repeated error gives exactly one ticket

Proves: R-006, D-005 · Kind: integration

- Given the same error written 100 times to the log within 10 minutes
- When the agent runs
- Then exactly one ticket exists for it, with occurrences 100

### T-006 Happy path: a new error becomes a complete Jira ticket within 15 minutes

Proves: R-004, R-005, D-006 · Kind: e2e

- Given a Jira test project, a running scheduler and a new ERROR line written to a log file
- When 15 minutes pass
- Then one Bug exists in the test project with title, summary, log excerpt, first-seen time, occurrence count and priority, all matching S-003

### T-007 Support team confirms last week's tickets

Proves: D-007 · Kind: manual

- Given last week's log files and a Jira test project
- When the agent runs over them and the support team reviews the tickets
- Then the number of tickets equals the number of distinct errors and the team confirms the tickets are right

### T-008 An error already ticketed in an earlier run gets no new ticket

Proves: R-007, D-013 · Kind: integration

- Given an error that got a ticket in a previous run, recorded in the state file
- When the same error appears again and the agent runs
- Then no new ticket is created

### T-009 Only new lines are read

Proves: R-001 · Kind: unit

- Given a log file already read up to its end in the previous run
- When the agent runs with no new lines
- Then no error event is produced, no LLM call is made and no ticket is created

### T-010 Only ERROR, FATAL and CRITICAL lines become error events

Proves: R-002, D-014 · Kind: unit

- Given a log with INFO, DEBUG and WARN lines and one error line followed by a stack trace
- When the agent selects error events
- Then exactly one S-001 event is produced, and its stack field holds the stack-trace lines

### T-011 Wrong Jira credentials stop the run without retries

Proves: R-009 · Kind: integration

- Given a new error and a mocked Jira that answers 401
- When the agent runs
- Then Jira receives one create attempt, the ticket stays in the queue with its attempt count unchanged, and the agent log has one credentials alert

### T-012 Empty or missing log file is skipped

Proves: R-010 · Kind: unit

- Given an empty log file and a configured file that does not exist
- When the agent runs
- Then the run ends without error and no ticket is created

### T-013 Unreadable lines are skipped and counted

Proves: R-011 · Kind: unit

- Given a log file with 3 binary lines and one readable error line
- When the agent runs
- Then one error event is produced and the run summary reports 3 skipped lines

### T-014 P-001 returns valid S-002 JSON

Proves: R-003 · Kind: prompt

- Given one ERROR event about a payments-api timeout
- When P-001 runs on Claude Haiku 5.5
- Then the output is valid JSON matching S-002 with one error and a priority from the allowed list

### T-015 P-001 separates different errors

Proves: R-016 · Kind: prompt

- Given two events with different causes, a database connection refusal and a missing field
- When P-001 runs on Claude Haiku 5.5
- Then the output has two errors with different fingerprints
