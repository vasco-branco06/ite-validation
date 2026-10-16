import { test, expect } from "@playwright/test";
import { countOrders, localDate, resetDb } from "./helpers";

test.beforeEach(() => resetDb());

test("T-001 a saved order appears in the list", async ({ page }) => {
  const tomorrow = localDate(1);

  // Given: the page opens at 127.0.0.1 with no login or password prompt
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(page.url()).toBe("http://127.0.0.1:3000/");
  await expect(page.locator('input[type="password"]')).toHaveCount(0);

  // When: the user fills in the order and clicks Save
  await page.getByLabel("Customer name").fill("Ana Silva");
  await page.getByLabel("Phone").fill("+351 912 345 678");
  await page.getByLabel("Cake").fill("Chocolate, 2 kg, Happy Birthday Ana");
  await page.getByLabel("Pickup date").fill(tomorrow);
  await page.getByLabel("Pickup time").fill("10:30");
  await page.getByRole("button", { name: "Save" }).click();

  // Then: within 3 seconds the list shows one order with exactly those values
  const orders = page.getByTestId("order");
  await expect(orders).toHaveCount(1, { timeout: 3000 });
  const order = orders.first();
  await expect(order.getByTestId("customer_name")).toHaveText("Ana Silva");
  await expect(order.getByTestId("phone")).toHaveText("+351 912 345 678");
  await expect(order.getByTestId("cake")).toHaveText("Chocolate, 2 kg, Happy Birthday Ana");
  await expect(order.getByTestId("pickup_date")).toHaveText(tomorrow);
  await expect(order.getByTestId("pickup_time")).toHaveText("10:30");

  // And: the database holds exactly one order
  expect(countOrders()).toBe(1);
});
