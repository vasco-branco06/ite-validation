# Scores: 4-web-app

Frozen tests from FROZEN-TESTS.md (commit 42603c1). Scored by the Claude Code session that played the user for A (not the test writer, who is not reachable), from code reading plus HTTP checks against the running app. No browser or phone was used; where a check relies on code reading, the evidence says so.

## A (folder ite-runs\4-web-app\A4)

| # | Result | Evidence |
|---|---|---|
| 1 | pass | Submit handler POSTs, then calls load() to re-render the list without a page reload (public/index.html lines 114-128); POST then GET returned the new entry. |
| 2 | pass | Entry added at 10:30:16 was still listed after the server was stopped and started again (SQLite file data.db). |
| 3 | pass | POST with empty name returned {"errors":{"name":"Name is required"}} and the entry count stayed 1; the page shows each error under its field (showErrors). |
| 4 | pass | The submit button is disabled while the request runs (button.disabled = true until finally), so a second click cannot send a second POST. Code reading only. |
| 5 | pass | UTF-8 body with <b>olá</b> and "ção ñ" came back byte for byte; the list renders with textContent, so HTML is shown as text. |
| 6 | fail | The textarea has maxlength="1000", so the browser silently cuts a 5000-character text to 1000 before submit: it neither shows the full text nor refuses with a message. The server message for over 1000 is never reached from the page. Code reading only. |
| 7 | pass | viewport meta width=device-width, main max-width 640px with 1rem padding, inputs width 100%. Code reading only; not opened on a phone. |
| 8 | pass | With data.db set read-only, POST returned 400 {"error":"attempt to write a readonly database"}, which the page shows in the form error line (showErrors({form: data.error})), not a blank screen. |

A: 7 of 8 passed (87.5%).

## B (folder ite-runs\4-web-app\B3)

B built a bakery cake-order app (the interview settled the domain). Same method as A: HTTP checks against the running app plus code reading.

| # | Result | Evidence |
|---|---|---|
| 1 | pass | Submit handler POSTs, then resetForm() and loadOrders() re-render the list without a reload (public/app.js); POST then GET returned the order. |
| 2 | pass | Order saved at 11:47:16Z was still listed after the server was stopped and started again (data/orders.db). |
| 3 | pass | POST with empty customer_name returned {"errors":{"customer_name":"Customer name is required."}}; the page also checks before sending and shows each error by its field. |
| 4 | pass | Two POSTs with the same Idempotency-Key returned 201 then 200 and the list held 1 such order; the page also blocks a second submit while saving. |
| 5 | pass | UTF-8 body with <b>olá</b> and "ção ñ" came back intact; orders render with textContent. |
| 6 | pass | A 5000-character cake text was accepted (201) and has no length limit in page or server. Not checked: one 5000-character word with no spaces would overflow its line (no overflow-wrap in style.css). |
| 7 | pass | viewport meta width=device-width, body max-width 48rem, form grid 9rem + 1fr. Code reading only; not opened on a phone. |
| 8 | pass | With data/orders.db read-only, POST returned 503 with "The database file cannot be written, so nothing was saved. Your typed order is still in the form...", shown by the page's form message. |

B: 8 of 8 passed (100%).

## ITE tests (B3/tests/cases.json, 15 cases)

Manual cases T-014 (one real day) and T-015 (README review) were not run for either version and are left out, so the base is 13 cases. Entry points adapted to A (entry instead of order); expectations unchanged.

- B: 13 of 13 (100%). npm test 47/47 re-run by this session at 12:48 local; npm run test:e2e 20/20 reported by the B session, not re-run here.
- A: 6 of 13 (46.2%). Pass: T-001 saved item appears, T-005 delete asks first, T-006 empty field saves nothing and keeps the text, T-009 double submit saves one, T-010 unwritable database shows an error and keeps the form, T-011 survives a restart. Fail: T-002, T-003, T-004, T-007, T-013 (no pickup dates, picked-up state or editing), T-008 (no phone field), T-012 (A listens on all interfaces, so another device can open it).
