# PLAN - Log-to-Jira Agent

Status legend: `todo` · `in-progress` · `done` · `blocked`. Work on one task at a time, in order.

## F-1 Setup and test harness

Goal: A Python 3.12 project with pytest, settings from `.env`, and no secrets in the repository. · Refs: R-014

### F-1.1 Project skeleton, settings and pytest · `todo`

Files: `pyproject.toml`, `.gitignore`, `.env.example`, `src/log_to_jira/__init__.py`, `src/log_to_jira/settings.py`, `tests/conftest.py`, `tests/test_secrets.py`
Steps: 1. Create the package and `pyproject.toml` with httpx, anthropic, pydantic, python-dotenv, pytest and respx. 2. Add `.env` to `.gitignore` and list every setting from SPEC section 8 in `.env.example` with empty values. 3. Load settings in `settings.py` from the environment only. 4. Write the secret-scan part of T-002 and see it pass.
Done when: T-002 (secret scan and `.gitignore` parts) passes.

## F-2 Data contracts (schemas in code)

Goal: Use the generated Pydantic models for every data shape. · Refs: R-002, R-003, R-004, R-007, S-001, S-002, S-003, S-004

### F-2.1 Wire the generated models · `todo`

Files: `schemas/*.py` (generated, read-only), `src/log_to_jira/models.py`, `tests/test_models.py`
Steps: 1. Re-export the generated models for S-001 to S-004 from `models.py`. 2. Write tests that valid examples load and invalid ones (bad priority, bad fingerprint) are rejected. 3. Load and save the state file (S-004) with an empty default when it does not exist.
Done when: T-010 parses its event into S-001 and T-008's state file loads as S-004 (model parts).

## F-3 Core behaviour

Goal: Read new lines, select errors, analyse them with P-001 and decide which need a new ticket. · Refs: R-001, R-002, R-003, R-006, R-007, R-010, R-011, R-012, R-016

### F-3.1 Log reader with read positions · `todo`

Files: `src/log_to_jira/reader.py`, `tests/test_reader.py`
Steps: 1. Read each file in `LOG_DIR` from its stored byte offset. 2. Skip empty and missing files. 3. Skip and count lines that are not valid text. 4. Return new lines and new offsets.
Done when: T-009, T-012 and T-013 pass.

### F-3.2 Error selection · `todo`

Files: `src/log_to_jira/select.py`, `tests/test_select.py`
Steps: 1. Match ERROR, FATAL and CRITICAL levels case-insensitively. 2. Attach following stack-trace lines to the event. 3. Build S-001 events.
Done when: T-010 passes.

### F-3.3 LLM analysis with fallback · `todo`

Files: `src/log_to_jira/analyse.py`, `prompts/P-001-analyse-errors.md`, `tests/test_analyse.py`
Steps: 1. Send the events to `claude-haiku-5-5` with P-001. 2. Validate the reply against S-002. 3. On error or invalid reply, build one fallback error per event with a title from the raw line and priority Medium. 4. Run the promptfoo tests.
Done when: T-004, T-014 and T-015 pass.

### F-3.4 Deduplication · `todo`

Files: `src/log_to_jira/dedupe.py`, `tests/test_dedupe.py`
Steps: 1. Count occurrences per fingerprint in the run. 2. Drop fingerprints already in the state file's `known` list. 3. Build one S-003 ticket per remaining fingerprint.
Done when: T-005 and T-008 pass.

## F-4 Integrations

Goal: Create Jira Bugs through the REST API, create-only. · Refs: R-004, R-013

### F-4.1 Create-only Jira client · `todo`

Files: `src/log_to_jira/jira_client.py`, `tests/test_jira_client.py`
Steps: 1. Implement one function that sends `POST /rest/api/3/issue` with an S-003 ticket, mapping fields to Jira fields and the fingerprint to a label. 2. Expose no update, transition or delete call. 3. Record the created key in the state file's `known` list.
Done when: T-002 (Jira call recording part) passes against a mocked Jira.

## F-5 Error handling

Goal: Never lose a ticket when Jira fails. · Refs: R-008, R-009

### F-5.1 Retry queue and credential errors · `todo`

Files: `src/log_to_jira/queue.py`, `tests/test_queue.py`
Steps: 1. Put every ticket in the queue before sending. 2. On 5xx or connection error, increase `attempts` and keep it; after the third failure, write an alert to the agent log. 3. On 401 or 403, stop sending for this run, keep the queue unchanged and write a credentials alert. 4. Remove a ticket from the queue only after Jira returns its key.
Done when: T-001 and T-011 pass.

## F-6 End-to-end and acceptance

Goal: Prove the whole run works within the time and volume targets. · Refs: R-004, R-005, R-015

### F-6.1 Main run and end-to-end tests · `todo`

Files: `src/log_to_jira/main.py`, `tests/test_e2e.py`, `tests/test_performance.py`
Steps: 1. Chain reader, selection, analysis, dedupe and queue in `main.py`, saving the state file at the end. 2. Write a run summary line to the agent log. 3. Run the 50 MB performance test with mocks. 4. Run the happy path against the Jira test project.
Done when: T-003 and T-006 pass.

### F-6.2 Hand check with the support team · `todo`

Files: none
Steps: 1. Run the agent over last week's logs into the Jira test project. 2. Ask the support team to review the tickets.
Done when: T-007 is confirmed by the support team.

## F-7 Packaging and README

Goal: Anyone on the team can install and schedule the agent. · Refs: R-005

### F-7.1 Scheduler setup and README · `todo`

Files: `README.md`, `scripts/cron.example`, `scripts/task-scheduler.xml`
Steps: 1. Write install, `.env` setup and run instructions. 2. Add a cron line and a Windows Task Scheduler definition that run every 10 minutes.
Done when: reviewed by the user.
