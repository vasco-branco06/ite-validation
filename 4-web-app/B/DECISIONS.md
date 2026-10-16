# DECISIONS - Bakery Cake Orders

## Decisions

### D-001 A counter order book for the bakery staff only

- **Decision:** The app records cake orders for a small bakery. Only the owner and one employee use it, at the counter or during phone calls, on one shared laptop in the shop. Customers never use the app. Volume is about 10 orders on a normal day and up to 30 before holidays.
- **Why:** The user described the bakery and who takes the orders.
  > It's for my small bakery. Customers order a cake: their name, phone, which cake, and the pickup date. I want to see all the orders in a list.
  > Me and my one employee, at the counter or when someone calls. Just one laptop in the shop.
- **Alternatives considered:** Customers filling in the form on their own phones; rejected because it would need internet hosting and protection.
- **Affects:** R-001, R-002, R-003, R-017

### D-002 Version 1 leaves out online ordering, payments and messages

- **Decision:** Out of scope for v1: online ordering by customers, payments, and automatic SMS or email messages to customers.
- **Why:** Each one adds an outside service or puts the app on the internet, and the order book works without them.
  > yes, leave those out
- **Alternatives considered:** None raised.
- **Affects:** R-016

### D-003 Order fields: free-text cake and a date with an optional time

- **Decision:** An order has a customer name, a phone number, a cake description typed as free text (it may include size and a message), a pickup date, and an optional pickup time. Name, phone, cake and pickup date are required.
- **Why:** Free text fits custom cakes without a menu to maintain; an optional time fits customers who give an exact time and those who do not.
  > ok, free text
- **Alternatives considered:** A fixed list of cakes; a date without a time.
- **Affects:** R-001, R-002, R-003, R-010

### D-004 List order: upcoming pickups first, soonest at the top

- **Decision:** The list shows upcoming orders first, soonest pickup at the top. Orders whose pickup date has passed are shown in a separate section below.
- **Why:** Opening the laptop in the morning shows at once which cakes are due next.
- **Alternatives considered:** Newest order first.
- **Affects:** R-004, R-005

### D-005 A "Picked up" button on each order

- **Decision:** Each order in the list has a "Picked up" button. Clicking it greys the order out and moves it to the bottom section.
- **Why:** Collected cakes would otherwise stay mixed with the ones still waiting.
- **Alternatives considered:** No pickup status.
- **Affects:** R-006

### D-006 Orders can be edited; deleting asks first

- **Decision:** Each order has an "Edit" button that changes any field. Each order can also be deleted, but deleting always asks "Are you sure?" first.
- **Why:** Customers often change plans, and the confirmation prevents losing an order with one wrong click.
- **Alternatives considered:** Create-only orders with no editing or deleting.
- **Affects:** R-007, R-008, R-009

### D-007 No app password; only the shop laptop can open the app

- **Decision:** The app has no password. It accepts connections only from the laptop it runs on, and the laptop's own login protects it.
- **Why:** Customers' phone numbers stay off the network, and the staff do not need another password.
- **Alternatives considered:** An app password.
- **Affects:** R-016, R-017

### D-008 Stack: Node.js with TypeScript and one SQLite file, on the shop laptop

- **Decision:** Node.js with TypeScript and a single SQLite database file, running locally on the shop laptop and opened in its web browser at a local address. No internet hosting.
- **Why:** One laptop, no cost, no accounts, and the whole database is one file that is easy to back up.
- **Alternatives considered:** Internet hosting.
- **Affects:** R-002, R-015, R-016

### D-009 Six named failure cases

- **Decision:** The app handles six failure cases: an empty required field, a pickup date in the past, a phone number with letters, Save clicked twice, a database file that cannot be written, and a laptop restart. The expected behaviour of each is in SPEC section 11.
- **Why:** These are the mistakes that really happen at a busy counter.
- **Alternatives considered:** None raised.
- **Affects:** R-010, R-011, R-012, R-013, R-014, R-015

### D-010 Integrations are not applicable

- **Decision:** The app talks to no outside system.
- **Why:** It runs on one laptop with a local database, and payments, online ordering and SMS/email are out of scope.
- **Alternatives considered:** None raised.
- **Affects:** R-016

### D-011 LLM use is not applicable

- **Decision:** The app uses no language model.
- **Why:** A form, a database and a list view involve no step that needs judgement.
- **Alternatives considered:** None raised.
- **Affects:** R-001

### D-012 Definition of done

- **Decision:** v1 is done when every acceptance test passes, one real day of orders entered on the shop laptop matches the owner's paper notes, and a one-page README explains how to start the app and back up the database file.
- **Why:** A real day at the counter is the test that counts, and the README lets the employee start the app alone.
- **Alternatives considered:** None raised.
- **Affects:** R-018

## Assumptions

### D-013 "Past" means before today, and timed orders come first within a day

- **Assumption:** The laptop's local date decides what is past: an order whose pickup date is today counts as upcoming, and a pickup date of today is accepted by the form; only dates before today are past. Within the same pickup date, orders with a time come first in time order, then orders without a time.
- **Why it matters:** The user chose "upcoming first" and "past dates are rejected" but not where today falls or how untimed orders sort; a wrong guess hides today's cakes or orders them confusingly.
- **If wrong:** Change the boundary (for example, move today's orders down once their time has passed) or put untimed orders first, then re-run the tripwire.
- **Tripwire:** T-013
