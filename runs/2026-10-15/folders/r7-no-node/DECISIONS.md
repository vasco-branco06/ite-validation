# DECISIONS - Low Stock Alert Sheet

## Decisions

### D-010 Low stock means at or below a per-product minimum, alerted the same day

- **Decision:** Each product has its own minimum stock in a column. When a product's quantity is at or below that minimum, the user gets an alert the same day.
- **Why:** The user accepted this rule as the meaning of "stock goes down" and as the success measure. The original idea:
  > uma folha de cálculo que me avisa quando o stock de um produto baixa
- **Alternatives considered:** One global threshold for all products; alert on any decrease. Neither was chosen.
- **Affects:** R-003, R-004, R-006

### D-011 One user: the sheet owner

- **Decision:** The only user is the person who owns the sheet. They use spreadsheets and Claude Code but do not write code by hand.
- **Why:** Inferred from the idea ("me avisa", alerts me). The user did not correct it.
- **Alternatives considered:** None raised.
- **Affects:** R-007, R-015

### D-012 No LLM step

- **Decision:** The project uses no language model.
- **Why:** Comparing a stock quantity with a threshold needs no judgement, so there is no LLM step.
- **Alternatives considered:** None raised.
- **Affects:** R-003

## Assumptions

### D-001 v1 only alerts; no orders, no sales tracking, one location

- **Assumption:** v1 only checks stock against the per-product minimums and alerts the user. Out of scope: automatic orders to suppliers, sales or invoice tracking (the user updates quantities by hand), and more than one warehouse or location.
- **Why it matters:** If the user expected orders or sales tracking, the sheet would look finished but not do the job they had in mind.
- **If wrong:** Add the missing feature as a new requirement in a later version. Do not widen v1.
- **Tripwire:** T-001

### D-002 Stock lives in one tab named Stock with Product, Quantity, Minimum

- **Assumption:** The data is one Google Sheet tab named `Stock` with columns Product, Quantity and Minimum and a header row in row 1. The user updates quantities by hand. There are up to 500 products, and the check runs once a day.
- **Why it matters:** The check reads these exact columns. Another layout or a much larger list would break it or make it too slow.
- **If wrong:** Change the column mapping in the schema and the code, or raise the size limit and re-test it.
- **Tripwire:** T-002

### D-003 Alert is a daily email plus red rows in the sheet

- **Assumption:** The alert is one daily email to the user's own Google account. It lists every product at or below its minimum, with the name, quantity and minimum. Those rows are also highlighted red in the sheet. No email is sent when nothing is low and no row has a problem.
- **Why it matters:** If the user expected a phone notification or a different channel, they would miss alerts.
- **If wrong:** Swap the email step for the channel the user wants. The check logic stays the same.
- **Tripwire:** T-003

### D-004 Only Google Sheets and Gmail; retry a failed email up to 3 attempts

- **Assumption:** The only integrations are Google Sheets and Gmail, through Apps Script built-in services (SpreadsheetApp, MailApp). If sending the email fails, the script makes at most 3 attempts. The red rows in the sheet stay as the fallback alert.
- **Why it matters:** If the email quota or the service fails silently, the user gets no alert.
- **If wrong:** Add another alert channel, or log the failure in a visible cell in the sheet.
- **Tripwire:** T-004

### D-005 Read data, change only formatting, email only the owner, no secrets

- **Assumption:** The script reads the `Stock` tab and only changes row background colour. It never edits quantities or minimums and never deletes anything. The email goes only to the sheet owner. There are no API keys. Access is the Google authorisation the user grants once at setup.
- **Why it matters:** If the script changes data by mistake, the user loses their stock records.
- **If wrong:** Stop and ask the user before adding any write access.
- **Tripwire:** T-005

### D-006 Google Sheets plus Apps Script, daily trigger at 08:00

- **Assumption:** The stack is Google Sheets plus Google Apps Script. A daily time-driven trigger runs the check at 08:00 in Google's cloud, so it works with the laptop off. There is no other runtime or hosting.
- **Why it matters:** If the user works in Excel or offline, the whole stack is wrong.
- **If wrong:** Rebuild the same requirements in Excel with Power Automate or an Office Script.
- **Tripwire:** T-006

### D-007 Named failure cases and their behaviour

- **Assumption:** A row with a blank or non-numeric quantity or minimum is skipped and listed in the email under "Rows with problems". The other rows are still checked. A product name that appears twice has each row checked and the duplicate listed as a problem. If the `Stock` tab is missing or empty, a short "sheet not found or empty" email is sent instead of an alert. At most one alert email is sent per day. A failed email follows D-004.
- **Why it matters:** Without these rules, one bad cell could stop all alerts, or the user could get duplicate emails.
- **If wrong:** Change the behaviour of that one case and its test. The other cases stay.
- **Tripwire:** T-007

### D-008 Acceptance is one test per requirement plus one end-to-end run

- **Assumption:** Acceptance is one Given/When/Then test per requirement, plus one happy-path end-to-end test.
- **Why it matters:** If the happy path is not covered end to end, the parts can pass on their own while the whole check fails.
- **If wrong:** Add the missing end-to-end case the user cares about.
- **Tripwire:** T-008

### D-009 Done means all tests pass and one real run looks right

- **Assumption:** v1 is done when all tests pass and one run by hand on the user's real product list sends an email that lists exactly the products the user sees at or below their minimum. A short README explains setup.
- **Why it matters:** Tests on sample data can pass while the real sheet has a layout the code does not expect.
- **If wrong:** Fix the layout mismatch, add it as a test, and run again.
- **Tripwire:** T-009

### D-013 Red highlight is cleared when a product is back above its minimum

- **Assumption:** When a product that was highlighted red is back above its minimum, the next check removes the red highlight from that row. The script only clears the red colour it set itself.
- **Why it matters:** Otherwise restocked products would stay red, and the sheet would stop showing what is really low.
- **If wrong:** Keep the red until the user clears it by hand, and drop R-016.
- **Tripwire:** T-012

### D-014 Tests run inside Apps Script, no Node on the laptop

- **Assumption:** Node.js is not installed, so tests run inside Apps Script. A `Tests.gs` file holds them, and the user runs it from the Apps Script editor. Code is copied into the editor by hand from the `src/` folder.
- **Why it matters:** If tests cannot run where the code runs, "done means green" cannot be checked.
- **If wrong:** Install Node.js, use clasp to push the code, and run the tests locally.
- **Tripwire:** T-016
