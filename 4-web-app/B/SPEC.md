# SPEC - Bakery Cake Orders

## 1. Problem

A small bakery takes cake orders at the counter and by phone. It needs one place to write down each order (customer name, phone, which cake, pickup date) and to see all orders in one list, so no cake is forgotten.

## 2. Goal and success measure

Goal: the owner and one employee record every cake order on one page and see all orders in one list (D-001).

Success measure: every order placed through the form appears in the list within a few seconds, and no order is ever lost or shown twice.

## 3. Users

- The bakery owner and one employee; customers never use the app (D-001).
- They enter orders at the counter or during phone calls, on one shared laptop in the shop.
- About 10 orders on a normal day, up to 30 before holidays.
- Comfortable with a web browser; they do not write code.

## 4. Scope

### In scope

- A single web page on the shop laptop with one order form.
- A local SQLite database that stores the orders.
- A list of all orders on the same page, with "Picked up", "Edit" and "Delete" on each order.

### Out of scope

- Online ordering by customers (D-002).
- Payments (D-002).
- Automatic SMS or email messages to customers (D-002).

### Later

Nothing planned.

## 5. Requirements

- **R-001** The page shows an order form with the fields customer name, phone, cake (free text) and pickup date, plus an optional pickup time. → T-001
- **R-002** Saving a valid form stores one order in the database, shaped as [S-001](schemas/S-001-order-input.schema.json), and the order appears in the list within a few seconds. → T-001, T-014
- **R-003** Each order in the list shows its customer name, phone, cake, pickup date and pickup time if given, shaped as [S-002](schemas/S-002-order.schema.json). → T-001, T-014
- **R-004** Upcoming orders that are not picked up are listed first, soonest pickup at the top. → T-002, T-013
- **R-005** Orders whose pickup date is before today, and orders marked picked up, are shown in a separate section below the upcoming orders. → T-002, T-013
- **R-006** Clicking "Picked up" on an order stores that status, greys the order out and moves it to the bottom section. → T-003
- **R-007** Clicking "Edit" on an order lets the user change any of its fields and save; the list then shows the new values in the right sorted place. → T-004
- **R-008** Clicking "Delete" on an order asks "Are you sure?"; choosing Cancel keeps the order unchanged. → T-005
- **R-009** Confirming the delete removes the order from the database and from the list. → T-005
- **R-010** Saving with an empty customer name, phone, cake or pickup date saves nothing, highlights the empty field and keeps everything typed. → T-006
- **R-011** Saving with a pickup date before today is rejected with a message, and nothing is saved. → T-007, T-013
- **R-012** Saving a phone number that contains anything other than digits, spaces and + is rejected with a message, and nothing is saved. → T-008
- **R-013** Clicking Save twice quickly saves exactly one order. → T-009
- **R-014** When the database file cannot be written, the page shows a clear error, the form keeps everything typed, and no partial order is stored. → T-010
- **R-015** Every saved order is still there after the app or the laptop restarts. → T-011
- **R-016** The app accepts connections only from the laptop it runs on (127.0.0.1) and makes no connection to any outside service. → T-012
- **R-017** The page opens directly in the browser with no login or password. → T-001
- **R-018** A one-page README explains how to start the app and how to back up the database file. → T-015

## 6. Data

- [S-001](schemas/S-001-order-input.schema.json) OrderInput: what the form sends when an order is created or edited. Used by R-002.
- [S-002](schemas/S-002-order.schema.json) Order: a stored order as the list shows it. Used by R-003.

## 7. Integrations

Not applicable: the app talks to no outside system; it runs on one laptop with a local database, and payments, online ordering and SMS/email are out of scope (D-010).

## 8. Permissions and security

- Data handled: customer names, phone numbers, cake descriptions and pickup dates.
- The app reads and writes only its own SQLite database file.
- Users can create orders, edit any order, mark orders picked up, and delete orders after an "Are you sure?" confirmation (D-006).
- No app password: the server listens only on 127.0.0.1, so only the shop laptop can open it, and the laptop's own login protects it (D-007).
- No secrets or API keys are needed.

## 9. Stack

- Language and runtime: TypeScript on Node.js 18 or later, run with `tsx` (D-008).
- Server: Express, serving one HTML page with plain browser JavaScript and a small JSON API.
- Database: one SQLite file (`data/orders.db`) through `better-sqlite3`.
- Validation: the generated Zod schemas in `schemas/*.zod.ts`, used on the server; the page also checks fields before sending.
- Tests: Vitest for unit and integration tests, Playwright for end-to-end tests in the browser.
- Hosting: none; it runs on the shop laptop and opens at `http://127.0.0.1:3000`.

## 10. LLM use

Not applicable: a form, a database and a list view involve no step that needs judgement (D-011).

## 11. Errors and edge cases

| Case | Expected behaviour | Test |
|---|---|---|
| A required field is empty | Nothing is saved, the empty field is highlighted, typed text is kept | T-006 |
| Pickup date is before today | Rejected with a message, nothing is saved | T-007 |
| Phone contains letters or other symbols | Rejected with a message; only digits, spaces and + are allowed | T-008 |
| Save is clicked twice quickly | Exactly one order is saved | T-009 |
| The database file cannot be written | A clear error is shown, the form keeps the typed order, nothing is half-saved | T-010 |
| The app or laptop restarts | All saved orders are still there | T-011 |

## 12. Definition of done

v1 is finished when (D-012):

- Every test in [tests/acceptance.md](tests/acceptance.md) passes.
- One real day of orders entered on the shop laptop matches the owner's paper notes (T-014).
- A one-page README explains how to start the app and back up the database file (T-015).
