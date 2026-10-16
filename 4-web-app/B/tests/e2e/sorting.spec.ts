import { test, expect, type Page } from "@playwright/test";
import { countOrders, daysSinceLast, daysUntilNext, localDate, resetDb, seedOrder } from "./helpers";

test.beforeEach(() => resetDb());

const namesIn = (page: Page, section: "upcoming" | "past") =>
  page.getByTestId(section).getByTestId("order").getByTestId("customer_name");

test("T-002 upcoming orders first, past orders below", async ({ page }) => {
  // The Friday and Saturday of the coming weekend, and the last Monday before today.
  const friday = daysUntilNext(5);
  seedOrder({ customer_name: "Saturday order", pickup_date: localDate(friday + 1) });
  seedOrder({ customer_name: "Friday order", pickup_date: localDate(friday) });
  seedOrder({ customer_name: "Last Monday order", pickup_date: localDate(-daysSinceLast(1)) });

  await page.goto("/");

  await expect(namesIn(page, "upcoming")).toHaveText(["Friday order", "Saturday order"]);
  await expect(namesIn(page, "past")).toHaveText(["Last Monday order"]);
});

test("T-013 (tripwire D-013) today is upcoming, timed orders first", async ({ page }) => {
  const today = localDate(0);
  seedOrder({ customer_name: "Today 15:00", pickup_date: today, pickup_time: "15:00" });
  seedOrder({ customer_name: "Today no time", pickup_date: today });
  seedOrder({ customer_name: "Today 09:00", pickup_date: today, pickup_time: "09:00" });
  seedOrder({ customer_name: "Yesterday", pickup_date: localDate(-1) });

  await page.goto("/");

  await expect(namesIn(page, "upcoming")).toHaveText(["Today 09:00", "Today 15:00", "Today no time"]);
  await expect(namesIn(page, "past")).toHaveText(["Yesterday"]);

  // A new order for today is accepted.
  await page.getByLabel("Customer name").fill("New today");
  await page.getByLabel("Phone").fill("912 000 000");
  await page.getByLabel("Cake").fill("Lemon tart");
  await page.getByLabel("Pickup date").fill(today);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(namesIn(page, "upcoming")).toHaveText(["Today 09:00", "Today 15:00", "Today no time", "New today"]);
  expect(countOrders()).toBe(5);
});
