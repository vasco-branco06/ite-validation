# PLAN - Vacation Requests

Status legend: `todo` · `in-progress` · `done` · `blocked`. Work on one task at a time, in order.

## F-1 Setup and test harness

Goal: a Next.js TypeScript project with Vitest and Playwright running, and local configuration in place · Refs: R-002

### F-1.1 Scaffold the project and test runners · `todo`

Files: `package.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `.gitignore`, `app/`
Steps: 1. Create a Next.js (App Router, TypeScript) project in this folder without overwriting the spec files. 2. Add Vitest and Playwright with one empty passing test each. 3. Write `.env.example` with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `RESEND_API_KEY`, `DATABASE_URL`, `MANAGER_EMAIL`, `ALLOWED_EMAIL_DOMAIN` and no values. 4. List `.env` in `.gitignore`.
Done when: reviewed by the user (`npx vitest run` and `npx playwright test` both run green).

## F-2 Data contracts (schemas in code)

Goal: the database table and the form and decision inputs follow the generated schemas · Refs: R-003, R-010, R-011, S-001, S-002, S-003

### F-2.1 Database table and validated request creation · `todo`

Files: `db/migrations/001_vacation_requests.sql`, `lib/db.ts`, `lib/requests.ts`, `schemas/S-001-vacation-request.zod.ts`, `schemas/S-002-new-vacation-request.zod.ts`, `schemas/S-003-manager-decision.zod.ts`
Steps: 1. Write T-007 as a Vitest test against a test database. 2. Create the `vacation_requests` table with the S-001 fields. 3. Implement `createRequest` that parses input with the S-002 Zod schema and saves status `pending`. 4. Import the S-003 Zod schema for decisions (used in F-3.4).
Done when: T-007

## F-3 Core behaviour

Goal: sign-in, submitting, listing, cancelling and deciding requests · Refs: R-001, R-002, R-003, R-004, R-005, R-006, R-007, R-008, R-009, R-010, R-011, R-012, R-013, R-018

### F-3.1 Google sign-in limited to the company domain · `todo`

Files: `auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`
Steps: 1. Write T-006 and T-002. 2. Configure Auth.js with the Google provider. 3. Refuse accounts whose email domain is not `ALLOWED_EMAIL_DOMAIN`. 4. Redirect every page and API route to sign-in when there is no session.
Done when: T-006, T-002

### F-3.2 Request form with date checks · `todo`

Files: `app/requests/new/page.tsx`, `app/requests/actions.ts`, `lib/requests.ts`
Steps: 1. Write T-003 and T-008. 2. Build the form with start date, end date and optional comment. 3. Reject end before start with the exact message in T-003. 4. Reject overlap with the person's own `pending` or `approved` requests.
Done when: T-003, T-008

### F-3.3 My requests list and cancel · `todo`

Files: `app/requests/page.tsx`, `app/requests/actions.ts`, `lib/requests.ts`
Steps: 1. Write T-009, T-010 and T-011. 2. List only the signed-in person's requests with status and reason. 3. Refuse access to other people's requests by id. 4. Add a cancel action for `pending` requests only.
Done when: T-009, T-010, T-011

### F-3.4 Manager pending list and decisions · `todo`

Files: `app/manager/page.tsx`, `app/manager/actions.ts`, `lib/decisions.ts`
Steps: 1. Write T-012, T-001, T-013 and T-014. 2. Show all `pending` requests, oldest first, only to `MANAGER_EMAIL`. 3. Implement approve and reject with an optional reason, parsed with the S-003 schema. 4. Refuse decisions from anyone else and on requests that are not `pending`.
Done when: T-012, T-001, T-013, T-014

### F-3.5 No delete anywhere · `todo`

Files: `app/api/requests/[id]/route.ts`
Steps: 1. Write T-018. 2. Make sure no route or action deletes a request; answer a delete attempt with "method not allowed".
Done when: T-018

## F-4 Integrations

Goal: emails for new requests and for decisions · Refs: R-014, R-015

### F-4.1 Email notifications through Resend · `todo`

Files: `lib/email.ts`, `lib/requests.ts`, `lib/decisions.ts`
Steps: 1. Write T-015 with a test double for the email client. 2. Send the manager an email on each new request. 3. Send the requester an email on each decision, with the reason when given (T-013 checks this).
Done when: T-015, T-013

## F-5 Error handling

Goal: email failures and sign-in outages never lose data · Refs: R-016, R-017

### F-5.1 Email retry and logging · `todo`

Files: `lib/email.ts`
Steps: 1. Write T-016. 2. Retry a failed send up to 3 tries in total. 3. Log the final failure without the API key. 4. Never roll back the request or decision because an email failed.
Done when: T-016

### F-5.2 Sign-in outage message · `todo`

Files: `app/auth/error/page.tsx`, `auth.ts`
Steps: 1. Write T-017. 2. Show "Sign-in is unavailable, try again later" when the Google provider errors.
Done when: T-017

## F-6 End-to-end and acceptance

Goal: the whole flow works in a browser · Refs: R-003, R-010, R-014

### F-6.1 Happy path end to end · `todo`

Files: `e2e/happy-path.spec.ts`
Steps: 1. Write T-004 in Playwright with test sign-in for one team member and the manager and an email test double. 2. Run the full Vitest and Playwright suites.
Done when: T-004

## F-7 Packaging and README

Goal: the team can use the deployed app, and anyone can run it from the README · Refs: R-001, R-002

### F-7.1 Deploy and write the README · `todo`

Files: `README.md`
Steps: 1. Write a README with local setup, the environment variables (names only) and deploy steps for Vercel and Supabase. 2. Deploy, set the environment variables in Vercel. 3. Ask the user to run T-005 by hand.
Done when: T-005
