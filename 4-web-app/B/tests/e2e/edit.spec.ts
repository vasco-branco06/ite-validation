import { test, expect } from "@playwright/test";
import { allOrders, daysUntilNext, localDate, resetDb, seedOrder } from "./helpers";

test.beforeEach(() => resetDb());

test("T-004 editing the pickup date updates and re-sorts the order", async ({ page }) => {
  const saturday = daysUntilNext(6);
  const mondayAfter = localDate(saturday + 2);
  seedOrder({ customer_name: "Ana", phone: "+351 912 345 678", cake: "Chocolate, 2 kg", pickup_date: localDate(saturday), pickup_time: "10:30" });
  seedOrder({ customer_name: "Bruno", pickup_date: localDate(saturday + 1) });

  await page.goto("/");
  const upcoming = page.getByTestId("upcoming").getByTestId("order");
  await expect(upcoming.getByTestId("customer_name")).toHaveText(["Ana", "Bruno"]);

  await upcoming.filter({ hasText: "Ana" }).getByRole("button", { name: "Edit" }).click();

  // The form holds Ana's order.
  await expect(page.getByLabel("Customer name")).toHaveValue("Ana");
  await expect(page.getByLabel("Phone")).toHaveValue("+351 912 345 678");
  await expect(page.getByLabel("Cake")).toHaveValue("Chocolate, 2 kg");
  await expect(page.getByLabel("Pickup date")).toHaveValue(localDate(saturday));
  await expect(page.getByLabel("Pickup time")).toHaveValue("10:30");

  await page.getByLabel("Pickup date").fill(mondayAfter);
  await page.getByRole("button", { name: "Save" }).click();

  // The list shows Ana's order with the new date below Bruno's.
  await expect(upcoming.getByTestId("customer_name")).toHaveText(["Bruno", "Ana"]);
  await expect(upcoming.filter({ hasText: "Ana" }).getByTestId("pickup_date")).toHaveText(mondayAfter);

  // The database holds the new date and still exactly two orders.
  const rows = allOrders();
  expect(rows).toHaveLength(2);
  expect(rows.find((r) => r.customer_name === "Ana")).toMatchObject({ pickup_date: mondayAfter, pickup_time: "10:30" });

  // The form is back to a new, empty order.
  await expect(page.getByLabel("Customer name")).toHaveValue("");
});

test("Cancel edit leaves the order unchanged", async ({ page }) => {
  seedOrder({ customer_name: "Ana", pickup_date: localDate(1) });
  await page.goto("/");
  await page.getByTestId("order").getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Customer name").fill("Changed");
  await page.getByRole("button", { name: "Cancel edit" }).click();

  await expect(page.getByLabel("Customer name")).toHaveValue("");
  await expect(page.getByTestId("order").getByTestId("customer_name")).toHaveText(["Ana"]);
  expect(allOrders().map((r) => r.customer_name)).toEqual(["Ana"]);
});
