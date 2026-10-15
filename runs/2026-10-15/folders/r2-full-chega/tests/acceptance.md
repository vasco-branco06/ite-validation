# Acceptance tests - Vacation Requests

Every test below also exists in [cases.json](cases.json) with the same ID. `Proves` lists the requirements and assumptions each test covers. Assumption tests are tripwires (see [CLAUDE.md](../CLAUDE.md)).

### T-001 A team member who is not the manager cannot approve a request

Proves: R-012, D-001 · Kind: integration

- Given a `pending` request and a signed-in team member whose email is not `MANAGER_EMAIL`
- When that team member sends an approve decision for the request
- Then the app refuses with a "not allowed" response, and the request stays `pending`

### T-002 A visitor who is not signed in is sent to Google sign-in

Proves: R-002, D-002 · Kind: e2e

- Given a browser with no session
- When it opens the app's home page or the manager's pending list
- Then it is redirected to the Google sign-in page, and no request data appears in the page

### T-003 A request with the end date before the start date is rejected

Proves: R-004, D-003 · Kind: integration

- Given a signed-in team member
- When they submit start date 2026-08-10 and end date 2026-08-05
- Then the form shows "The end date must be on or after the start date", and no request is saved

### T-004 End to end: submit, approve, see approved, receive email

Proves: R-003, R-010, R-014, D-004 · Kind: e2e

- Given a signed-in team member and the manager, with the email service replaced by a test double
- When the team member submits 2026-08-03 to 2026-08-14, and the manager approves it
- Then the team member's list shows the request as `approved`, and one approval email with those dates was sent to the team member

### T-005 A real request is approved in the deployed app

Proves: D-005 · Kind: manual

- Given the app deployed on Vercel and the user signed in with their company Google account
- When they submit one real request and the manager approves it
- Then the requester receives the approval email and sees `approved` in the app

### T-006 An account outside the company domain is refused

Proves: R-001, D-003 · Kind: integration

- Given `ALLOWED_EMAIL_DOMAIN` set to `example.com`
- When someone signs in with `someone@gmail.com`
- Then sign-in is refused with a message, and no request data is shown

### T-007 A submitted request is saved as pending

Proves: R-003 · Kind: integration

- Given a signed-in team member
- When they submit start date 2026-09-01, end date 2026-09-05 and comment "Family trip"
- Then one request matching S-001 is saved with status `pending`, their email and name, and those dates and comment

### T-008 A request overlapping the person's own request is rejected

Proves: R-005, D-003 · Kind: integration

- Given a team member with an `approved` request from 2026-08-03 to 2026-08-14
- When they submit a new request from 2026-08-10 to 2026-08-20
- Then the form shows a message that it overlaps an existing request, and nothing new is saved

### T-009 A team member sees their own requests with status

Proves: R-006 · Kind: integration

- Given a team member with one `pending`, one `approved` and one `rejected` request with reason "Team is short that week"
- When they open their requests list
- Then the three requests appear with dates and status, and the rejected one shows the reason

### T-010 A team member never sees another person's requests

Proves: R-007, D-001 · Kind: integration

- Given team member A with one request and team member B with one request
- When A opens their requests list, and A asks for B's request by its id
- Then A's list holds only A's request, and the request for B's id is refused

### T-011 A team member cancels their own pending request

Proves: R-008, D-001 · Kind: integration

- Given a team member with a `pending` request
- When they cancel it
- Then its status becomes `cancelled`, and it disappears from the manager's pending list

### T-012 The manager sees all pending requests

Proves: R-009 · Kind: integration

- Given two `pending` requests from different team members and one `approved` request
- When the manager opens the pending list
- Then exactly the two pending requests appear, oldest first, with name, dates and comment

### T-013 The manager rejects with a reason and the requester is told why

Proves: R-011, R-014, D-014 · Kind: integration

- Given a `pending` request and the email service replaced by a test double
- When the manager rejects it with reason "Team is short that week"
- Then the request status is `rejected` with that reason, and one rejection email containing the reason was sent to the requester

### T-014 A request cannot be decided twice

Proves: R-013, D-003 · Kind: integration

- Given a request the manager has already `approved`
- When the manager sends a reject decision for the same request
- Then the request stays `approved`, and no second decision email is sent

### T-015 The manager is emailed about a new request

Proves: R-015, D-013 · Kind: integration

- Given the email service replaced by a test double
- When a team member submits a request from 2026-10-01 to 2026-10-03
- Then one email with the requester's name and those dates was sent to `MANAGER_EMAIL`

### T-016 An email failure is retried 3 times and logged

Proves: R-016, D-003 · Kind: integration

- Given the email service test double fails on every send
- When the manager approves a `pending` request
- Then the send was tried 3 times in total, one failure is logged, and the request still shows `approved` in the app

### T-017 Google sign-in down shows a clear message

Proves: R-017 · Kind: integration

- Given the Google sign-in provider returns an error
- When a visitor tries to sign in
- Then the page shows "Sign-in is unavailable, try again later", and no request data changes

### T-018 Nobody can delete a request

Proves: R-018, D-001 · Kind: integration

- Given a request and a signed-in manager
- When a delete is attempted on that request through the app's API
- Then the app refuses, and the request still exists unchanged
