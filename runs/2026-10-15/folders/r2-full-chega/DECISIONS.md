# DECISIONS - Vacation Requests

## Decisions

### D-006 Success measure: every request goes through the app

- **Decision:** The app replaces vacation requests by email or word of mouth. Success means every vacation request goes through the app and the manager answers each one within 2 business days.
- **Why:** The user's idea, accepted with the recommended success measure:
  > uma app interna onde a equipa regista pedidos de férias e o gestor aprova ou recusa
- **Alternatives considered:** None raised.
- **Affects:** R-003, R-009, R-010, R-011

### D-007 Users: up to 20 team members and one manager

- **Decision:** Up to 20 team members submit requests a few times a year. One single manager reviews them as they arrive. Everyone uses email and a browser; nobody is technical.
- **Why:** The recommendation was accepted. One manager means a single approver and no routing between managers.
- **Alternatives considered:** Several managers, each approving their own team. Not needed for v1.
- **Affects:** R-009, R-012

### D-008 v1 exclusions

- **Decision:** v1 does not track remaining vacation days, does not connect to payroll and does not handle other absence types (sick leave, unjustified absences).
- **Why:** The recommendation was accepted. Each of these multiplies the work, and the app is useful without them.
- **Alternatives considered:** None raised.
- **Affects:** R-003

### D-009 Request fields

- **Decision:** A request has a start date, an end date and an optional comment. The requester's identity comes from the sign-in, not from a form field.
- **Why:** The recommendation was accepted. It is the minimum the manager needs to decide, and few fields mean fewer mistakes.
- **Alternatives considered:** None raised.
- **Affects:** R-003, R-004

### D-010 How people learn about decisions

- **Decision:** The requester receives an email with the decision and can see each request's status in the app. The manager sees a list of all pending requests in the app.
- **Why:** The recommendation was accepted. Nobody has to chase a request, and the manager sees at once what is waiting.
- **Alternatives considered:** None raised.
- **Affects:** R-006, R-009, R-014

### D-011 Google Workspace sign-in and an email sending service

- **Decision:** People sign in with their company Google Workspace account. Emails go out through a transactional email service. If an email fails, the app retries 3 times; the decision always stays visible in the app.
- **Why:** The recommendation was accepted. Reusing the accounts the team already has avoids creating and managing new passwords.
- **Alternatives considered:** Microsoft 365 sign-in and email.
- **Affects:** R-001, R-002, R-014, R-016, R-017

### D-012 No LLM use

- **Decision:** The llm area is not applicable.
- **Why:** Submitting and approving requests needs no judgement from a model; the manager decides.
- **Alternatives considered:** None raised.
- **Affects:** R-010, R-011

## Assumptions

### D-001 Permissions: own requests only, manager decides, nothing is deleted

- **Assumption:** Only company Google accounts (one email domain, set in `ALLOWED_EMAIL_DOMAIN`) can sign in. The manager is the one account whose email is set in `MANAGER_EMAIL`. Team members create and see only their own requests and can cancel them while they are pending. Only the manager can approve or reject. Nobody can delete a request. Secrets (Google OAuth client secret, email service API key, database URL, session secret) live in `.env` locally and in the host's environment variables in production, never in code.
- **Why it matters:** If team members could approve or see each other's requests, the approval flow means nothing and private dates leak.
- **If wrong:** Ask the user who else may approve or see requests, then add those roles as new requirements.
- **Tripwire:** T-001

### D-002 Stack: Next.js web app with Postgres on managed hosting

- **Assumption:** A TypeScript web app (Next.js, App Router) with a Postgres database, hosted on Vercel with Supabase for the database. Sign-in uses Auth.js with the Google provider; emails go through Resend. The app is reachable only after signing in with a company Google account.
- **Why it matters:** The app must be available to the whole team at any time without anyone maintaining a server.
- **If wrong:** Keep the requirements and schemas; swap the hosting or libraries and re-run the tests.
- **Tripwire:** T-002

### D-003 Five named failure cases

- **Assumption:** The failure cases are: (1) end date before start date: the form is rejected with a message and nothing is saved; (2) a request overlapping one of the same person's pending or approved requests: rejected with a message; (3) the email service fails: retry 3 times, log the failure, the status stays visible in the app; (4) a decision on a request that is already decided or cancelled: the first decision stands and nothing changes; (5) sign-in with an account outside the company domain: access refused, nothing shown.
- **Why it matters:** These are the ways a small approval app most often goes wrong; without them a bad request or a lost email goes unnoticed.
- **If wrong:** Add or change the failure cases in SPEC section 11 and give each its own test.
- **Tripwire:** T-003

### D-004 Acceptance: one end-to-end happy path plus one test per requirement and failure case

- **Assumption:** v1 is accepted when every requirement and every failure case has a passing Given/When/Then test, and the end-to-end path (submit, approve, status shows Approved, approval email sent) passes.
- **Why it matters:** The user does not read code; the tests are how they know it works.
- **If wrong:** Add the user's own real case to `tests/acceptance.md` and `tests/cases.json`.
- **Tripwire:** T-004

### D-005 Definition of done

- **Assumption:** v1 is done when all tests pass, the app is deployed and reachable by the team with company Google accounts, a README explains how to run and deploy it, and one real request has been submitted, approved and emailed in the deployed app.
- **Why it matters:** Passing tests on a laptop is not the same as the team using the app.
- **If wrong:** Ask the user what they would check by hand and add it to the checklist.
- **Tripwire:** T-005

### D-013 The manager is emailed when a new request arrives

- **Assumption:** When a team member submits a request, the manager receives an email with the requester's name and the dates.
- **Why it matters:** The success measure asks for an answer within 2 business days; the manager has to know a request is waiting without opening the app every day.
- **If wrong:** Remove the email and let the manager check the pending list instead.
- **Tripwire:** T-015

### D-014 The manager can give an optional reason

- **Assumption:** When approving or rejecting, the manager can type an optional reason (up to 500 characters). The reason is shown in the app and included in the decision email.
- **Why it matters:** A rejection without a reason makes people ask by email, which the app is meant to replace.
- **If wrong:** Hide the reason field; decisions stay a plain approve or reject.
- **Tripwire:** T-013
