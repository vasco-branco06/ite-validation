import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { countOrders, localDate, resetDb, seedOrder } from "./helpers";

test.beforeEach(() => resetDb());

test("T-010 an unwritable database shows an error and keeps the form", async ({ page }) => {
  seedOrder({ customer_name: "First order", pickup_date: localDate(1) });
  await page.goto("/");
  await expect(page.getByTestId("order")).toHaveCount(1);

  const values = {
    "Customer name": "Ana Silva",
    Phone: "+351 912 345 678",
    Cake: "Chocolate, 2 kg",
    "Pickup date": localDate(2),
    "Pickup time": "10:30",
  };
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label).fill(value);

  // Another program locks the database file, so it cannot be written.
  const lock = new Database(process.env.E2E_DB_PATH!);
  lock.exec("BEGIN EXCLUSIVE");
  try {
    await page.getByRole("button", { name: "Save" }).click();
    // The page shows a clear error.
    await expect(page.locator("#form-message")).toHaveText(/database.*cannot be written.*nothing was saved/i, { timeout: 10000 });
  } finally {
    lock.exec("ROLLBACK");
    lock.close();
  }

  // The form still holds the typed values.
  for (const [label, value] of Object.entries(values)) await expect(page.getByLabel(label)).toHaveValue(value);
  // The database still holds only the first order.
  expect(countOrders()).toBe(1);

  // Saving again once the file is free works.
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("order")).toHaveCount(2);
  expect(countOrders()).toBe(2);
});
