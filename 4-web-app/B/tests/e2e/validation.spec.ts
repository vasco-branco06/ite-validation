import { test, expect, type Page } from "@playwright/test";
import { countOrders, localDate, resetDb } from "./helpers";

test.beforeEach(() => resetDb());

const LABELS = {
  customer_name: "Customer name",
  phone: "Phone",
  cake: "Cake",
  pickup_date: "Pickup date",
  pickup_time: "Pickup time",
} as const;
type Field = keyof typeof LABELS;

function goodOrder(): Record<Field, string> {
  return {
    customer_name: "Ana Silva",
    phone: "+351 912 345 678",
    cake: "Chocolate, 2 kg, Happy Birthday Ana",
    pickup_date: localDate(1),
    pickup_time: "10:30",
  };
}

async function fillForm(page: Page, values: Record<Field, string>) {
  for (const [field, label] of Object.entries(LABELS) as [Field, string][]) {
    await page.getByLabel(label).fill(values[field]);
  }
}

async function expectFormHolds(page: Page, values: Record<Field, string>) {
  for (const [field, label] of Object.entries(LABELS) as [Field, string][]) {
    await expect(page.getByLabel(label)).toHaveValue(values[field]);
  }
}

test.describe("T-006 an empty required field saves nothing and keeps the typed text", () => {
  for (const empty of ["customer_name", "phone", "cake", "pickup_date"] as const) {
    test(`${LABELS[empty]} left empty`, async ({ page }) => {
      await page.goto("/");
      const values = { ...goodOrder(), [empty]: "" };
      await fillForm(page, values);
      await page.getByRole("button", { name: "Save" }).click();

      // The empty field is highlighted and says why.
      const input = page.getByLabel(LABELS[empty]);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveClass(/invalid/);
      await expect(page.getByTestId(`${empty}-error`)).toHaveText(/required/i);

      // Only that field is highlighted.
      for (const other of Object.keys(LABELS) as Field[]) {
        if (other !== empty) await expect(page.getByLabel(LABELS[other])).not.toHaveAttribute("aria-invalid", "true");
      }

      // The other fields still hold what was typed, and nothing is saved.
      await expectFormHolds(page, values);
      await expect(page.getByTestId("order")).toHaveCount(0);
      expect(countOrders()).toBe(0);
    });
  }

  test("the highlight clears once the field is fixed and saved", async ({ page }) => {
    await page.goto("/");
    await fillForm(page, { ...goodOrder(), customer_name: "" });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByLabel("Customer name")).toHaveAttribute("aria-invalid", "true");

    await page.getByLabel("Customer name").fill("Ana Silva");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("order")).toHaveCount(1);
    await expect(page.getByLabel("Customer name")).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("customer_name-error")).toHaveText("");
  });
});

test("T-007 a pickup date in the past is rejected", async ({ page }) => {
  await page.goto("/");
  const values = { ...goodOrder(), pickup_date: localDate(-1) };
  await fillForm(page, values);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByTestId("pickup_date-error")).toHaveText(/pickup date is in the past/i);
  await expect(page.getByLabel("Pickup date")).toHaveAttribute("aria-invalid", "true");
  await expectFormHolds(page, values);
  expect(countOrders()).toBe(0);
});

test("T-008 a phone number with letters is rejected", async ({ page }) => {
  await page.goto("/");
  const values = { ...goodOrder(), phone: "91234abc" };
  await fillForm(page, values);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByTestId("phone-error")).toHaveText(/only digits, spaces and \+/i);
  await expect(page.getByLabel("Phone")).toHaveAttribute("aria-invalid", "true");
  await expectFormHolds(page, values);
  expect(countOrders()).toBe(0);

  // The same form with phone "+351 912 345 678" is accepted.
  await page.getByLabel("Phone").fill("+351 912 345 678");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("order")).toHaveCount(1);
  expect(countOrders()).toBe(1);
});

test("the server rejects the same mistakes on its own", async ({ request }) => {
  const order = { ...goodOrder() } as Record<string, string | null>;
  const cases: [Record<string, string | null>, string, RegExp][] = [
    [{ ...order, customer_name: "" }, "customer_name", /required/i],
    [{ ...order, cake: "   " }, "cake", /required/i],
    [{ ...order, pickup_date: localDate(-1) }, "pickup_date", /in the past/i],
    [{ ...order, phone: "91234abc" }, "phone", /only digits, spaces and \+/i],
  ];
  for (const [body, field, message] of cases) {
    const res = await request.post("/api/orders", { data: body });
    expect(res.status()).toBe(400);
    expect((await res.json()).errors[field]).toMatch(message);
  }
  expect(countOrders()).toBe(0);
});
