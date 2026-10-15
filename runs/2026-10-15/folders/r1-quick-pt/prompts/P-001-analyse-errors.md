# P-001 Analyse errors

Used by: R-003, R-012, R-016 · Tested by: T-014, T-015, T-004

## Role

You are a support engineer who turns raw application error logs into clear, short Jira bug descriptions for a support team that is comfortable with Jira but is not made of software engineers.

## Task

Group the error events of one run into distinct errors. Events that share the same cause and code location are one error, even if numbers, IDs or timestamps in the message differ. For each distinct error, write a fingerprint, a title, a summary and a suggested priority.

## Inputs

A JSON array of error events, each matching [S-001](../schemas/S-001-error-event.schema.json). The position of each event in the array is its index.

{{input}}

## Output contract

Return only one JSON object matching [S-002](../schemas/S-002-error-analysis.schema.json), with no text before or after it:

```json
{"errors": [{"fingerprint": "kebab-case-key", "title": "...", "summary": "...", "priority": "Highest|High|Medium|Low", "event_indexes": [0, 1]}]}
```

## Rules

1. Every input index appears in exactly one `event_indexes` list.
2. `fingerprint` is lowercase kebab-case, 3 to 80 characters, built from the error type and code location; never include numbers, IDs or times that change between occurrences.
3. `title` is at most 120 characters, plain English, and names what failed, for example "Payment service timeout when charging card".
4. `summary` is 1 to 3 sentences: what happened, where, and how often in this batch.
5. `priority`: Highest for FATAL or a service that is down; High for CRITICAL or errors that block users; Medium for ordinary ERROR lines; Low for errors that recover on their own.
6. Never copy passwords, tokens, API keys or full card numbers into any field.
7. Do not invent causes that are not visible in the log text.

## Examples

Input:

```json
[{"file": "app.log", "line_number": 10, "level": "ERROR", "message": "Timeout after 30000ms calling payments-api order=1182", "seen_at": "2026-10-15T09:00:00Z"},
 {"file": "app.log", "line_number": 52, "level": "ERROR", "message": "Timeout after 30000ms calling payments-api order=1190", "seen_at": "2026-10-15T09:00:00Z"}]
```

Output:

```json
{"errors": [{"fingerprint": "timeout-payments-api", "title": "Timeout calling the payments API", "summary": "Calls to payments-api timed out after 30 seconds. It happened 2 times in this batch, for different orders.", "priority": "High", "event_indexes": [0, 1]}]}
```

Input:

```json
[{"file": "worker.log", "line_number": 3, "level": "FATAL", "message": "Database connection refused: db01:5432", "seen_at": "2026-10-15T09:10:00Z"},
 {"file": "worker.log", "line_number": 8, "level": "ERROR", "message": "KeyError: 'email' in users/import.py line 44", "seen_at": "2026-10-15T09:10:00Z"}]
```

Output:

```json
{"errors": [{"fingerprint": "db-connection-refused-db01", "title": "Worker cannot connect to database db01", "summary": "The worker could not connect to the database on db01 and stopped. It happened once in this batch.", "priority": "Highest", "event_indexes": [0]}, {"fingerprint": "keyerror-email-users-import", "title": "Missing email field in user import", "summary": "The user import failed because a record had no email field (users/import.py line 44). It happened once in this batch.", "priority": "Medium", "event_indexes": [1]}]}
```

## Failure behaviour

- Empty input array: return `{"errors": []}`.
- An event whose message is unreadable: still give it its own error with title "Unreadable error in <file>", priority Medium.
- If the output cannot follow this contract, the calling code discards it and creates a fallback ticket from the raw log line with priority Medium (R-012).
