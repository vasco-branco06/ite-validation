# SPEC - Low Stock Alert Sheet

## 1. Problem

The user keeps product stock in a spreadsheet and has no way to notice in time when a product runs low. They have to scan the list by hand.

## 2. Goal and success measure

A Google Sheet that alerts the user when a product's stock is low (D-010). Success measure: every product whose quantity is at or below its own minimum appears in an alert to the user on the same day.

## 3. Users

One user, the sheet owner (D-011). They use spreadsheets and Claude Code but do not write code by hand. They update quantities by hand and read the alert once a day.

## 4. Scope

### In scope

- One `Stock` tab with Product, Quantity and Minimum per product (D-002).
- A daily automatic check, and a check the user can start by hand.
- A daily alert email and red highlighting of low rows (D-003).

### Out of scope

- Automatic orders to suppliers (D-001).
- Sales or invoice tracking; quantities are updated by hand (D-001).
- More than one warehouse or location (D-001).
- Any LLM or AI step (D-012).

### Later

Nothing planned.

## 5. Requirements

- **R-001** The check reads the `Stock` tab, with a header row in row 1 and one product per row with Product, Quantity and Minimum, as defined in S-001. → T-002
- **R-002** A time-driven trigger runs the check automatically once a day at 08:00. → T-006
- **R-003** A product counts as low when its Quantity is less than or equal to its Minimum. → T-010
- **R-004** When at least one product is low, the check sends one email listing every low product with its name, quantity and minimum, in the shape of S-002. → T-003
- **R-005** When no product is low and no row has a problem, the check sends no email. → T-011
- **R-006** The check highlights the row of every low product in red. → T-003
- **R-007** The alert email is sent only to the sheet owner's address. → T-005
- **R-008** The check never changes a Quantity or Minimum value and never deletes a row. → T-005
- **R-009** A row whose Quantity or Minimum is blank or not a number is skipped and listed in the email under "Rows with problems". The other rows are still checked. → T-007
- **R-010** When a product name appears in more than one row, each row is checked on its own and the repeated rows are listed under "Rows with problems". → T-013
- **R-011** When the `Stock` tab is missing or has no product rows, the check sends one "sheet not found or empty" email and no alert. → T-014
- **R-012** At most one alert email is sent per calendar day, even if the check runs more than once. → T-015
- **R-013** When sending the email fails, the check makes at most 3 attempts in total and leaves the red highlighting in place. → T-004
- **R-014** A check on 500 product rows finishes without error within the Apps Script run-time limit. → T-002
- **R-015** The user can start the check by hand from a custom menu in the sheet. → T-009
- **R-016** When a row that the check highlighted red is no longer low, the next check removes that red highlight. → T-012

## 6. Data

- [S-001](schemas/S-001-stock-row.schema.json) One product row in the Stock tab. Used by R-001.
- [S-002](schemas/S-002-alert-email.schema.json) Content of one daily alert email. Used by R-004.

## 7. Integrations

- Google Sheets: read the `Stock` tab and set row background colours, through the Apps Script SpreadsheetApp service (D-004).
- Gmail: send the alert email to the owner, through the Apps Script MailApp service (D-004). When it is down, see R-013.
- Auth: the Google authorisation the user grants once when the script first runs. There are no API keys.

## 8. Permissions and security

- Reads: the `Stock` tab only (D-005).
- Writes: row background colour only; never values, never deletions (R-008).
- Sends: email to the sheet owner only (R-007).
- Secrets: none. The script runs under the owner's Google account. Do not hard-code email addresses; read the owner's address at run time.

## 9. Stack

Google Sheets plus Google Apps Script (V8 runtime), with a daily time-driven trigger and a custom menu (D-006). Source lives in `src/` (`Code.gs`, `Tests.gs`) and is copied into the Apps Script editor. Tests run in Apps Script through `Tests.gs` (D-014). The generated `schemas/*.zod.ts` and `schemas/*.py` are reference contracts only; the Apps Script code mirrors S-001 and S-002 by hand.

## 10. LLM use

Not applicable: comparing a stock quantity with a threshold needs no judgement (D-012). See [prompts/NOT_APPLICABLE.md](prompts/NOT_APPLICABLE.md).

## 11. Errors and edge cases

| Case | Expected behaviour | Test |
|---|---|---|
| Quantity blank or not a number | Row skipped, listed under "Rows with problems", other rows checked | T-007 |
| Minimum blank or not a number | Row skipped, listed under "Rows with problems", other rows checked | T-007 |
| Same product name in two rows | Each row checked; repeated rows listed under "Rows with problems" | T-013 |
| `Stock` tab missing or empty | One "sheet not found or empty" email, no alert | T-014 |
| Check runs twice the same day | At most one alert email that day | T-015 |
| Email sending fails | At most 3 attempts; red rows stay as fallback | T-004 |

## 12. Definition of done

- Every test in [tests/acceptance.md](tests/acceptance.md) passes (D-009).
- One check run by hand on the user's real product list sends an email that lists exactly the products the user sees at or below their minimum (T-009).
- A README explains how to paste the code, authorise it and install the daily trigger.
