# SPEC - Vacation Requests

## 1. Problem

Team members ask for vacation by email or word of mouth. Requests get lost, the manager has no single view of what is waiting, and people have to chase answers.

## 2. Goal and success measure

An internal web app where team members submit vacation requests and the manager approves or rejects them (D-006).

Success measure: every vacation request goes through the app, and the manager answers each one within 2 business days. No more requests by email or word of mouth.

## 3. Users

- **Team members:** up to 20 people. Each submits a few requests a year and checks their status. They use email and a browser; nobody is technical (D-007).
- **Manager:** one single person who reviews requests as they arrive (D-007).

## 4. Scope

### In scope

- Sign-in with company Google accounts.
- Submitting a vacation request (start date, end date, optional comment).
- Seeing one's own requests and their status, and cancelling a pending one.
- The manager's list of pending requests, and approving or rejecting each one with an optional reason.
- Email notifications for new requests and for decisions.

### Out of scope

- Tracking how many vacation days each person has left (D-008).
- Any connection to payroll (D-008).
- Other absence types, such as sick leave or unjustified absences (D-008).
- More than one manager or approval chains (D-007).
- Deleting requests (D-001).

### Later

Nothing planned.

## 5. Requirements

- **R-001** Only accounts from the company Google Workspace domain (set in `ALLOWED_EMAIL_DOMAIN`) can sign in; any other account is refused and sees no data. → T-006
- **R-002** A visitor who is not signed in is sent to the Google sign-in page and sees no request data. → T-002
- **R-003** A signed-in team member can submit a request with a start date, an end date and an optional comment of up to 500 characters (S-002); it is saved with status `pending` (S-001). → T-007, T-004
- **R-004** A request whose end date is before its start date is rejected with a clear message and nothing is saved. → T-003
- **R-005** A request that overlaps one of the same person's `pending` or `approved` requests is rejected with a clear message and nothing is saved. → T-008
- **R-006** A team member sees a list of their own requests with dates and status (`pending`, `approved`, `rejected`, `cancelled`), plus the manager's reason when there is one. → T-009
- **R-007** A team member never sees another person's requests. → T-010
- **R-008** A team member can cancel their own request while it is `pending`; its status becomes `cancelled`. → T-011
- **R-009** The manager sees a list of all `pending` requests from everyone, oldest first, with name, dates and comment. → T-012
- **R-010** The manager can approve a `pending` request (S-003); its status becomes `approved`. → T-004
- **R-011** The manager can reject a `pending` request with an optional reason of up to 500 characters (S-003); its status becomes `rejected`. → T-013
- **R-012** Only the account set in `MANAGER_EMAIL` can approve or reject; anyone else is refused and the request stays `pending`. → T-001
- **R-013** A request that is already `approved`, `rejected` or `cancelled` cannot be decided again; the first outcome stands. → T-014
- **R-014** When a request is approved or rejected, the requester receives an email with the decision, the dates and the reason if one was given. → T-004, T-013
- **R-015** When a request is submitted, the manager receives an email with the requester's name and the dates. → T-015
- **R-016** If sending an email fails, the app retries 3 times, then logs the failure; the request and its status are saved and visible in the app either way. → T-016
- **R-017** If Google sign-in is unavailable, the app shows a clear "sign-in is unavailable, try again later" message and no request data changes. → T-017
- **R-018** No user, including the manager, can delete a request. → T-018

## 6. Data

- [S-001](schemas/S-001-vacation-request.schema.json) A stored vacation request with its status. Used by R-003.
- [S-002](schemas/S-002-new-vacation-request.schema.json) The form a team member submits. Used by R-003.
- [S-003](schemas/S-003-manager-decision.schema.json) The manager's approve or reject decision. Used by R-010, R-011.

## 7. Integrations

- **Google Workspace (sign-in):** inbound identity only. OAuth 2.0 through Auth.js with the Google provider; the app reads the account's name and email. Credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. If Google is down, nobody can sign in and the app shows a message (R-017) (D-011).
- **Email service (Resend):** outbound only. Sends the new-request email to the manager and the decision email to the requester. Credential: `RESEND_API_KEY`. If it fails, retry 3 times, then log (R-016) (D-011).
- **Postgres (Supabase):** the app's own database. Credential: `DATABASE_URL` (D-002).

## 8. Permissions and security

- Data handled: names, work email addresses, vacation dates, comments and reasons. No other personal data.
- Team members: create, read and cancel only their own requests (R-007, R-008).
- Manager: reads all requests and approves or rejects pending ones (R-009, R-012).
- Nobody deletes requests (R-018).
- Secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `RESEND_API_KEY`, `DATABASE_URL`. They live in `.env` locally (listed in `.gitignore`) and in Vercel environment variables in production, never in code. `MANAGER_EMAIL` and `ALLOWED_EMAIL_DOMAIN` are configuration, set the same way (D-001).

## 9. Stack

- Language: TypeScript. Framework: Next.js (App Router) on Node.js 20 (D-002).
- Hosting: Vercel; database: Postgres on Supabase (D-002).
- Libraries: Auth.js (Google provider), Resend, Zod (generated schemas in `schemas/*.zod.ts`).
- Tests: Vitest for unit and integration tests, Playwright for end-to-end tests.

## 10. LLM use

Not applicable: submitting and approving requests needs no judgement from a model; the manager decides (D-012). See [prompts/NOT_APPLICABLE.md](prompts/NOT_APPLICABLE.md).

## 11. Errors and edge cases

| Case | Expected behaviour | Test |
|---|---|---|
| End date before start date | Form rejected with a clear message; nothing saved (R-004, D-003) | T-003 |
| Overlaps the person's own pending or approved request | Rejected with a clear message; nothing saved (R-005, D-003) | T-008 |
| Email service fails | Retry 3 times, then log; status saved and visible in the app (R-016, D-003) | T-016 |
| Decision on an already decided or cancelled request | First outcome stands; nothing changes (R-013, D-003) | T-014 |
| Sign-in with an account outside the company domain | Access refused; no data shown (R-001, D-003) | T-006 |
| Non-manager tries to approve or reject | Refused; request stays pending (R-012) | T-001 |
| Google sign-in unavailable | Clear message; no data changes (R-017) | T-017 |

## 12. Definition of done

- Every test in [tests/acceptance.md](tests/acceptance.md) passes.
- The app is deployed on Vercel and reachable by the team with company Google accounts.
- A README explains how to run it locally and how to deploy it.
- In the deployed app, one real request has been submitted and approved, and the requester received the email and sees `approved` (D-005, T-005).
