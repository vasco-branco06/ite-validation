import { test, expect } from "@playwright/test";
import { allOrders, localDate, resetDb, seedOrder } from "./helpers";

test.beforeEach(() => resetDb());

test("T-005 Delete asks first; Cancel keeps, confirm removes", async ({ page }) => {
  seedOrder({ customer_name: "Ana", phone: "912 345 678", cake: "Lemon tart", pickup_date: localDate(1), pickup_time: "11:00" });
  const before = allOrders();

  await page.goto("/");
  const order = page.getByTestId("order");
  await expect(order).toHaveCount(1);

  const dialogs: string[] = [];

  // Delete, then Cancel: the order stays.
  page.once("dialog", (dialog) => {
    dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    void dialog.dismiss();
  });
  await order.getByRole("button", { name: "Delete" }).click();
  await expect.poll(() => dialogs.length).toBe(1);
  await expect(order).toHaveCount(1);
  await expect(order.getByTestId("customer_name")).toHaveText("Ana");
  await expect(order.getByTestId("cake")).toHaveText("Lemon tart");
  expect(allOrders()).toEqual(before);

  // Delete again, then confirm: the order is gone.
  page.once("dialog", (dialog) => {
    dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    void dialog.accept();
  });
  await order.getByRole("button", { name: "Delete" }).click();
  await expect(order).toHaveCount(0);
  expect(allOrders()).toEqual([]);

  // An "Are you sure?" confirmation appeared each time.
  expect(dialogs).toEqual(["confirm: Are you sure?", "confirm: Are you sure?"]);
});
