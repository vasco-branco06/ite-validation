import { test, expect } from "@playwright/test";
import { localDate, pickedUpByName, resetDb, seedOrder } from "./helpers";

test.beforeEach(() => resetDb());

test("T-003 Picked up greys an order out and moves it down", async ({ page }) => {
  seedOrder({ customer_name: "First order", pickup_date: localDate(1), pickup_time: "09:00" });
  seedOrder({ customer_name: "Second order", pickup_date: localDate(2) });

  await page.goto("/");
  const upcoming = page.getByTestId("upcoming").getByTestId("order");
  const past = page.getByTestId("past").getByTestId("order");
  await expect(upcoming.getByTestId("customer_name")).toHaveText(["First order", "Second order"]);

  await upcoming.filter({ hasText: "First order" }).getByRole("button", { name: "Picked up" }).click();
  await expect(past.getByTestId("customer_name")).toHaveText(["First order"]);
  await page.reload();

  // That order is greyed out in the bottom section.
  await expect(past.getByTestId("customer_name")).toHaveText(["First order"]);
  const moved = past.first();
  await expect(moved).toHaveClass(/picked-up/);
  const opacity = await moved.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeLessThan(1);
  await expect(moved.getByRole("button", { name: "Picked up" })).toHaveCount(0);

  // The other order is still at the top.
  await expect(upcoming.getByTestId("customer_name")).toHaveText(["Second order"]);

  // The database marks only the first order as picked up.
  expect(pickedUpByName()).toEqual({ "First order": true, "Second order": false });
});
