# PLAN - Bakery Cake Orders

Status legend: `todo` · `in-progress` · `done` · `blocked`. Work on one task at a time, in order.

## F-1 Setup and test harness

Goal: a TypeScript Node project with Vitest and Playwright that can run the acceptance tests · Refs: R-001, R-017

### F-1.1 Project scaffold and test runners · `done` (2026-10-16)

Files: `package.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/server.ts`, `tests/e2e/order-form.spec.ts`
Steps: 1. Create `package.json` with `express`, `better-sqlite3`, `zod`, `tsx`, `typescript`, `vitest`, `@playwright/test`, and the scripts `start`, `test`, `test:e2e`. 2. Add `tsconfig.json` (strict) and the Vitest and Playwright configs; Playwright starts the server on 127.0.0.1:3000 against a temporary database file. 3. Add `data/` and `node_modules/` to `.gitignore`. 4. Write `src/server.ts` as an empty Express app serving `public/index.html`. 5. Write T-001 as a Playwright test and see it fail.
Done when: T-001 runs and fails for the right reason (no form yet).

## F-2 Data contracts (schemas in code)

Goal: the order shapes and the SQLite store, used everywhere through the generated schemas · Refs: R-002, R-003, R-015, S-001, S-002

### F-2.1 Validation from the generated schemas · `done` (2026-10-16)

Files: `src/validate.ts`, `tests/unit/validate.test.ts`
Steps: 1. Import the schemas from `schemas/S-001-order-input.zod.ts` and `schemas/S-002-order.zod.ts`. 2. Add the rule that the pickup date is not before today (laptop local date, D-013). 3. Return field-level messages for empty fields, a bad phone and a past date.
Done when: the validation parts of T-006, T-007, T-008 and T-013 pass as unit tests.

### F-2.2 SQLite order store · `done` (2026-10-16)

Files: `src/db.ts`, `tests/integration/db.test.ts`
Steps: 1. Open or create `data/orders.db` (path configurable for tests) with one `orders` table matching S-002. 2. Add create, list, update, mark picked up and delete functions, each in a transaction. 3. Return rows shaped as S-002.
Done when: T-011 passes.

## F-3 Core behaviour

Goal: the one page: form, sorted list, Picked up, Edit, Delete · Refs: R-001, R-002, R-003, R-004, R-005, R-006, R-007, R-008, R-009, R-017

### F-3.1 Order form saves to the list · `done` (2026-10-16)

Files: `src/server.ts`, `public/index.html`, `public/app.js`, `public/style.css`
Steps: 1. Add `GET /api/orders` and `POST /api/orders` using `src/validate.ts` and `src/db.ts`. 2. Build the form with the five fields and a Save button, with no login. 3. After a save, refresh the list without reloading the page.
Done when: T-001 passes.

### F-3.2 List sorting and sections · `done` (2026-10-16)

Files: `src/sort.ts`, `public/app.js`, `tests/unit/sort.test.ts`
Steps: 1. Split orders into upcoming (not picked up, pickup date today or later) and the bottom section (picked up or pickup date before today). 2. Sort upcoming by date, then timed orders by time, then untimed orders (D-013). 3. Render the two sections.
Done when: T-002 and T-013 pass.

### F-3.3 Picked up button · `done` (2026-10-16)

Files: `src/server.ts`, `public/app.js`, `public/style.css`
Steps: 1. Add `POST /api/orders/:id/picked-up`. 2. Add the button on each order; grey out picked-up orders in the bottom section.
Done when: T-003 passes.

### F-3.4 Edit an order · `done` (2026-10-16)

Files: `src/server.ts`, `public/app.js`
Steps: 1. Add `PUT /api/orders/:id` with the same validation as create. 2. "Edit" fills the form with the order; Save updates it and re-sorts the list.
Done when: T-004 passes.

### F-3.5 Delete with confirmation · `done` (2026-10-16)

Files: `src/server.ts`, `public/app.js`
Steps: 1. Add `DELETE /api/orders/:id`. 2. "Delete" asks "Are you sure?"; only a confirm sends the request.
Done when: T-005 passes.

## F-4 Integrations

Goal: no outside services; the app is reachable only from the shop laptop · Refs: R-016

### F-4.1 Listen on 127.0.0.1 only · `done` (2026-10-16)

Files: `src/server.ts`, `tests/integration/network.test.ts`
Steps: 1. There are no integrations (D-010); bind the server to 127.0.0.1 only. 2. Test that the laptop's network address refuses the connection and that no code opens an outbound connection.
Done when: T-012 passes.

## F-5 Error handling

Goal: every named failure case behaves as SPEC section 11 says · Refs: R-010, R-011, R-012, R-013, R-014

### F-5.1 Form validation messages · `done` (2026-10-16)

Files: `public/app.js`, `public/style.css`, `src/server.ts`
Steps: 1. Check the fields in the page before sending and on the server. 2. Highlight empty fields and show messages for a past date and a bad phone. 3. Never clear the form on an error.
Done when: T-006, T-007 and T-008 pass.

### F-5.2 One order per Save · `done` (2026-10-16)

Files: `public/app.js`, `src/server.ts`
Steps: 1. Disable Save while a request is in flight. 2. Send a one-time submission key with each form submit and ignore a repeated key on the server.
Done when: T-009 passes.

### F-5.3 Database write failure · `done` (2026-10-16)

Files: `src/db.ts`, `src/server.ts`, `public/app.js`, `tests/integration/db-failure.test.ts`
Steps: 1. Wrap writes in a transaction and return a clear error when the write fails. 2. Show the error on the page and keep the form values.
Done when: T-010 passes.

## F-6 End-to-end and acceptance

Goal: every acceptance test green, then one real day in the shop · Refs: R-002, R-003

### F-6.1 Full acceptance run · `done` (2026-10-16)

Files: `tests/e2e/`, `tests/integration/`, `tests/unit/`
Steps: 1. Run every automated test in `tests/cases.json`. 2. Fix any failure in code, never in the spec.
Done when: T-001 to T-013 all pass.

### F-6.2 One real day in the shop · `blocked` (2026-10-16): waiting for the owner to run one real day in the shop and confirm T-014

Files: none
Steps: 1. The owner and employee take one real day of orders in the app and on paper. 2. Compare the list with the paper notes.
Done when: T-014 is confirmed by the user.

## F-7 Packaging and README

Goal: the owner can start the app and back up the database without help · Refs: R-018

### F-7.1 README and start command · `in-progress` (2026-10-16)

Files: `README.md`, `package.json`
Steps: 1. Write a one-page README: install once, start with `npm start`, open `http://127.0.0.1:3000`, stop the app, and copy `data/orders.db` to a backup location. 2. Keep it in plain words for a non-engineer.
Done when: T-015 is confirmed by the user.
