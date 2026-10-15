# PLAN - Low Stock Alert Sheet

Status legend: `todo` · `in-progress` · `done` · `blocked`. Work on one task at a time, in order.

## F-1 Setup and test harness

Goal: a test file that runs inside Apps Script and reports PASS or FAIL per test · Refs: R-001

### F-1.1 Create the source folder and the Apps Script test harness · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Create `src/Code.gs` with an empty `runCheck` function. 2. Create `src/Tests.gs` with a tiny `assert` helper and `runAllTests`, which logs one PASS or FAIL line per test and a total. 3. Ask the user to paste both files into the sheet's Apps Script editor and run `runAllTests`.
Done when: T-016

## F-2 Data contracts (schemas in code)

Goal: the Apps Script code reads rows and builds emails in the shapes of S-001 and S-002 · Refs: R-001, R-004, S-001, S-002

### F-2.1 Read Stock rows into StockRow objects · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Write `readStockRows(sheet)`, which returns one object per row from row 2, with product, quantity and minimum as in S-001. 2. Mark rows that do not match S-001 as problems, not errors. 3. Add a test with 500 rows.
Done when: T-002

### F-2.2 Build the AlertEmail object · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Write `buildAlert(rows, ownerEmail, today)`, which returns an object in the shape of S-002. 2. Test it with sample rows.
Done when: T-003

## F-3 Core behaviour

Goal: decide which products are low and mark them in the sheet · Refs: R-003, R-005, R-006, R-016

### F-3.1 Low-stock rule · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Write `isLow(quantity, minimum)`, which returns true when quantity is at or below minimum. 2. Test the boundary values.
Done when: T-010

### F-3.2 Highlight low rows and clear restocked rows · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Set a red background on low rows. 2. Remove only that red from rows that are no longer low. 3. Change nothing else.
Done when: T-003, T-012

### F-3.3 No email when nothing needs attention · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. In `runCheck`, skip sending when there are no low products and no problem rows.
Done when: T-011

## F-4 Integrations

Goal: send the email to the owner, run daily, and allow a manual run · Refs: R-002, R-004, R-007, R-008, R-015

### F-4.1 Send the alert email to the owner only · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Read the owner's address at run time with `Session.getEffectiveUser().getEmail()`. 2. Send with `MailApp.sendEmail` to that address only. 3. Check that no Quantity or Minimum value changed.
Done when: T-005

### F-4.2 Daily trigger and custom menu · `todo`

Files: `src/Code.gs`
Steps: 1. Write `installTrigger`, which creates one daily time-driven trigger for `runCheck` at 08:00 and removes duplicates. 2. Add an `onOpen` menu with a "Check stock now" item that runs `runCheck`.
Done when: T-006, T-009

## F-5 Error handling

Goal: every named failure case behaves as SPEC section 11 says · Refs: R-009, R-010, R-011, R-012, R-013

### F-5.1 Invalid cells and duplicate names · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Skip rows with a blank or non-numeric Quantity or Minimum and list them as problems. 2. List rows that repeat a product name as duplicate_product, and still check each row.
Done when: T-007, T-013

### F-5.2 Missing or empty Stock tab · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. When the tab is missing or has only the header row, send one "sheet not found or empty" email and stop.
Done when: T-014

### F-5.3 One alert per day and email retry · `todo`

Files: `src/Code.gs`, `src/Tests.gs`
Steps: 1. Store the date of the last alert in Script Properties and skip the alert if it is today. 2. Wrap the send in at most 3 attempts. 3. Leave the red rows in place when all attempts fail.
Done when: T-015, T-004

## F-6 End-to-end and acceptance

Goal: one full run proves the whole check works, and v1 does nothing beyond the alert · Refs: R-003, R-004

### F-6.1 End-to-end run on a sample sheet · `todo`

Files: `src/Tests.gs`
Steps: 1. Build a sample `Stock` tab with 3 products, one exactly at its minimum. 2. Run `runCheck`. 3. Confirm the email lists only that product and that nothing else was created or sent.
Done when: T-008, T-001

## F-7 Packaging and README

Goal: the user can set it up and confirm it on their real list · Refs: R-002, R-015

### F-7.1 README and real-list check · `todo`

Files: `README.md`
Steps: 1. Write how to paste `src/` into the Apps Script editor, authorise it, and run `installTrigger`. 2. Ask the user to run "Check stock now" on their real list and compare the email with the sheet.
Done when: T-009
