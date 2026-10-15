# Acceptance tests - Low Stock Alert Sheet

Every test below also exists in [cases.json](cases.json) with the same ID. `Proves` lists the requirements and assumptions each test covers. Assumption tests are tripwires (see [CLAUDE.md](../CLAUDE.md)).

### T-001 A low product triggers only an alert to the owner, nothing else

Proves: D-001 · Kind: assumption

- Given a `Stock` tab where one product is below its minimum
- When the check runs
- Then the only effects are one email to the owner and a red row; no order, no other recipient, no other tab is created or changed

### T-002 A check on 500 product rows finishes without error

Proves: R-001, R-014, D-002 · Kind: integration

- Given a `Stock` tab with a header row and 500 product rows with Product, Quantity and Minimum
- When the check runs
- Then it finishes without error within the Apps Script run-time limit, and every row was read

### T-003 Two low products and one above give an email with exactly those two and two red rows

Proves: R-004, R-006, D-003 · Kind: integration

- Given 3 products: A at its minimum, B below its minimum, C above its minimum
- When the check runs
- Then one email lists exactly A and B with name, quantity and minimum, the rows of A and B are red, and the row of C is not red

### T-004 A failed email send makes at most 3 attempts and keeps the red rows

Proves: R-013, D-004 · Kind: unit

- Given one low product and an email sender that always fails
- When the check runs
- Then the sender is called at most 3 times and the low row is still red

### T-005 A check changes no values and emails only the owner

Proves: R-007, R-008, D-005 · Kind: integration

- Given a `Stock` tab with known Quantity and Minimum values and at least one low product
- When the check runs
- Then every Quantity and Minimum is unchanged, no row is deleted, and the email recipient is only the sheet owner's address

### T-006 The daily trigger runs the check at 08:00 with the laptop off

Proves: R-002, D-006 · Kind: manual

- Given the daily trigger is installed and one product is below its minimum
- When the laptop stays off overnight
- Then the alert email arrives by 09:00 the next morning

### T-007 A row with a blank or text Quantity or Minimum is skipped and listed as a problem

Proves: R-009, D-007 · Kind: unit

- Given 3 rows: one with Quantity blank, one with Minimum set to "abc", one valid and low
- When the check runs
- Then the valid row is in the alert, and the other two are listed under "Rows with problems" and are not in the low list

### T-008 End to end: one product exactly at its minimum gives one email with only that product

Proves: R-003, R-004, D-008 · Kind: e2e

- Given a sheet with 3 products, one exactly at its minimum and two above
- When the daily check runs
- Then one email arrives that lists only that product

### T-009 A check started by hand on the real list matches what the user sees

Proves: R-015, D-009 · Kind: manual

- Given the user's real product list and no alert email sent yet today
- When the user starts the check from the custom menu
- Then the email lists exactly the products the user sees at or below their minimum

### T-010 Low means at or below the minimum

Proves: R-003 · Kind: unit

- Given minimum 5 and quantities 4, 5 and 6
- When each is tested for low stock
- Then 4 and 5 are low and 6 is not

### T-011 No low products and no problems means no email

Proves: R-005 · Kind: unit

- Given every product above its minimum and no problem rows
- When the check runs
- Then no email is sent

### T-012 A restocked row loses its red highlight

Proves: R-016, D-013 · Kind: integration

- Given a row that the check highlighted red, and its Quantity is then raised above its Minimum
- When the check runs again
- Then that row is no longer red

### T-013 A repeated product name is checked per row and listed as a problem

Proves: R-010 · Kind: unit

- Given two rows with the same product name, one of them low
- When the check runs
- Then the low row is in the alert, and both rows are listed under "Rows with problems" as duplicate_product

### T-014 A missing or empty Stock tab sends one notice and no alert

Proves: R-011 · Kind: unit

- Given a sheet with no `Stock` tab, or a `Stock` tab with only the header row
- When the check runs
- Then one "sheet not found or empty" email is sent and no alert email

### T-015 Running the check twice the same day sends at most one alert email

Proves: R-012 · Kind: unit

- Given one low product and an alert email already sent today
- When the check runs again the same day
- Then no second alert email is sent

### T-016 The Apps Script test file runs from the editor and reports results

Proves: D-014 · Kind: assumption

- Given `Code.gs` and `Tests.gs` pasted into the sheet's Apps Script editor
- When the user runs `runAllTests` from the editor
- Then the log shows one PASS or FAIL line per test and a total, without Node.js on the laptop
