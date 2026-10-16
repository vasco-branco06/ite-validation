import { test, expect, type Page } from "@playwright/test";
import { countOrders, localDate, resetDb } from "./helpers";

test.beforeEach(() => resetDb());

async function fillValidForm(page: Page) {
  await page.getByLabel("Customer name").fill("Ana Silva");
  await page.getByLabel("Phone").fill("+351 912 345 678");
  await page.getByLabel("Cake").fill("Chocolate, 2 kg");
  await page.getByLabel("Pickup date").fill(localDate(1));
  await page.getByLabel("Pickup time").fill("10:30");
}

test("T-009 clicking Save twice saves one order", async ({ page }) => {
  await page.goto("/");
  await fillValidForm(page);
  await page.getByRole("button", { name: "Save" }).dblclick();

  await expect(page.getByTestId("order")).toHaveCount(1);
  // Give a second request time to land, if one was sent.
  await page.waitForTimeout(500);
  await expect(page.getByTestId("order")).toHaveCount(1);
  expect(countOrders()).toBe(1);
});

test("T-009 two submits while the first save is still on its way save one order", async ({ page }) => {
  const posts: string[] = [];
  // Hold every save for a moment, like a slow laptop.
  await page.route("**/api/orders", async (route) => {
    if (route.request().method() === "POST") {
      posts.push(route.request().headers()["idempotency-key"] ?? "");
      await new Promise((r) => setTimeout(r, 400));
    }
    await route.continue();
  });

  await page.goto("/");
  await fillValidForm(page);
  // Submit twice without waiting, bypassing the button's disabled state.
  await page.evaluate(() => {
    const form = document.getElementById("order-form") as HTMLFormElement;
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();

  await expect(page.getByTestId("order")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  expect(posts).toHaveLength(1);
  expect(posts[0]).not.toBe("");
  expect(countOrders()).toBe(1);
});

test("the next order gets a new submission key", async ({ page }) => {
  const keys: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().endsWith("/api/orders")) keys.push(req.headers()["idempotency-key"] ?? "");
  });
  await page.goto("/");
  await fillValidForm(page);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("order")).toHaveCount(1);
  await fillValidForm(page);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("order")).toHaveCount(2);

  expect(keys).toHaveLength(2);
  expect(keys[0]).not.toBe(keys[1]);
  expect(countOrders()).toBe(2);
});

test("the server ignores a repeated submission key", async ({ request }) => {
  const data = { customer_name: "Ana", phone: "912 345 678", cake: "Lemon tart", pickup_date: localDate(1), pickup_time: null };
  const headers = { "Idempotency-Key": "test-key-123" };

  const first = await request.post("/api/orders", { data, headers });
  expect(first.status()).toBe(201);
  const second = await request.post("/api/orders", { data, headers });
  expect(second.status()).toBe(200);
  expect(await second.json()).toEqual(await first.json());
  expect(countOrders()).toBe(1);

  // A different key is a different order.
  const third = await request.post("/api/orders", { data, headers: { "Idempotency-Key": "test-key-456" } });
  expect(third.status()).toBe(201);
  expect(countOrders()).toBe(2);
});
