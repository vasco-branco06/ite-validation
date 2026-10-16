# Acceptance tests - Bakery Cake Orders

Every test below also exists in [cases.json](cases.json) with the same ID. `Proves` lists the requirements and assumptions each test covers. Assumption tests are tripwires (see [CLAUDE.md](../CLAUDE.md)).

### T-001 A saved order appears in the list

Proves: R-001, R-002, R-003, R-017 · Kind: e2e

- Given the app is running with an empty database and the page is opened at 127.0.0.1 with no login
- When the user fills in name "Ana Silva", phone "+351 912 345 678", cake "Chocolate, 2 kg, Happy Birthday Ana", a pickup date tomorrow and time 10:30, and clicks Save
- Then within 3 seconds the list shows one order with exactly those values, and the database holds exactly one order

### T-002 The list sorts upcoming orders first and past orders below

Proves: R-004, R-005 · Kind: e2e

- Given saved orders with pickup dates next Saturday, next Friday, and last Monday (none picked up)
- When the page is opened
- Then the upcoming section lists Friday then Saturday, and the last Monday order is in the bottom section

### T-003 Picked up greys an order out and moves it down

Proves: R-006 · Kind: e2e

- Given two upcoming orders
- When the user clicks "Picked up" on the first one and reloads the page
- Then that order is greyed out in the bottom section, the other order is still at the top, and the database marks only the first as picked up

### T-004 Editing the pickup date updates and re-sorts the order

Proves: R-007 · Kind: e2e

- Given upcoming orders for Saturday ("Ana") and Sunday ("Bruno")
- When the user clicks "Edit" on Ana's order, changes the date to the Monday after, and saves
- Then the list shows Ana's order with the new date below Bruno's, and the database holds the new date and still two orders

### T-005 Delete asks first; Cancel keeps, confirm removes

Proves: R-008, R-009 · Kind: e2e

- Given one saved order
- When the user clicks "Delete" and chooses Cancel, then clicks "Delete" again and confirms
- Then after Cancel the order is unchanged in the list and database, and after confirming it is gone from both

### T-006 An empty required field saves nothing and keeps the typed text

Proves: R-010 · Kind: e2e

- Given the form with phone, cake and pickup date filled in and the name left empty (repeat for each of the four required fields)
- When the user clicks Save
- Then nothing is saved, the empty field is highlighted, and the other fields still hold what was typed

### T-007 A pickup date in the past is rejected

Proves: R-011 · Kind: e2e

- Given a fully filled form with a pickup date of yesterday
- When the user clicks Save
- Then a message says the pickup date is in the past, and the database still holds no order

### T-008 A phone number with letters is rejected

Proves: R-012 · Kind: e2e

- Given a fully filled form with phone "91234abc"
- When the user clicks Save
- Then a message says the phone may contain only digits, spaces and +, and nothing is saved; "+351 912 345 678" is accepted

### T-009 Clicking Save twice saves one order

Proves: R-013 · Kind: e2e

- Given a fully filled valid form
- When the user double-clicks Save
- Then the list and the database hold exactly one order

### T-010 An unwritable database shows an error and keeps the form

Proves: R-014 · Kind: integration

- Given the app running with one saved order and the database made unwritable
- When the user saves a valid new order
- Then the page shows a clear error, the form still holds the typed values, and the database still holds only the first order

### T-011 Orders survive a restart

Proves: R-015 · Kind: integration

- Given three saved orders
- When the app process is stopped and started again
- Then the list shows the same three orders with the same values and picked-up status

### T-012 Another device cannot open the app

Proves: R-016 · Kind: integration

- Given the app running
- When a request is made to the laptop's network address (not 127.0.0.1) on the app's port
- Then the connection is refused, and the server code opens no outbound connection

### T-013 Today's orders count as upcoming and timed orders sort first

Proves: D-013, R-004, R-005, R-011 · Kind: assumption

- Given orders for today 15:00, today with no time, today 09:00, and yesterday (not picked up)
- When the page is opened, and a new order for today is saved
- Then the upcoming section lists today 09:00, today 15:00, then today with no time; yesterday's order is in the bottom section; and the new order for today is accepted

### T-014 One real day of orders matches the paper notes

Proves: R-002, R-003 · Kind: manual

- Given the app installed on the shop laptop
- When the owner and employee enter one real day of orders while also writing them on paper
- Then at the end of the day every paper order is in the list once, with the same details

### T-015 The README explains starting the app and backing up

Proves: R-018 · Kind: manual

- Given only the README
- When the owner follows it on the shop laptop
- Then the app starts and opens in the browser, and the owner can copy the database file to a backup location
