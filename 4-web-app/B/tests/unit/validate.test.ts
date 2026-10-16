import { describe, it, expect } from "vitest";
import { validateOrderInput, localDateString } from "../../src/validate";

// A fixed "now" in the laptop's local time zone: 2026-10-16 14:00.
const now = new Date(2026, 9, 16, 14, 0);
const today = "2026-10-16";
const yesterday = "2026-10-15";
const tomorrow = "2026-10-17";

const valid = {
  customer_name: "Ana Silva",
  phone: "+351 912 345 678",
  cake: "Chocolate, 2 kg, Happy Birthday Ana",
  pickup_date: tomorrow,
  pickup_time: "10:30",
};

describe("localDateString", () => {
  it("formats the local date as YYYY-MM-DD", () => {
    expect(localDateString(now)).toBe(today);
    expect(localDateString(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });
});

describe("T-006 an empty required field is rejected and named", () => {
  for (const field of ["customer_name", "phone", "cake", "pickup_date"] as const) {
    it(`rejects an empty ${field}`, () => {
      const result = validateOrderInput({ ...valid, [field]: "" }, now);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(Object.keys(result.errors)).toEqual([field]);
      expect(result.errors[field]).toMatch(/required/i);
    });

    it(`rejects a ${field} of only spaces`, () => {
      const result = validateOrderInput({ ...valid, [field]: "   " }, now);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[field]).toMatch(/required/i);
    });
  }

  it("names every empty field at once", () => {
    const result = validateOrderInput({ ...valid, customer_name: "", cake: "" }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(["cake", "customer_name"]);
  });

  it("treats a missing pickup time as optional", () => {
    for (const pickup_time of [undefined, null, ""]) {
      const result = validateOrderInput({ ...valid, pickup_time }, now);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.pickup_time).toBeNull();
    }
  });
});

describe("T-007 a pickup date in the past is rejected", () => {
  it("rejects yesterday with a past-date message", () => {
    const result = validateOrderInput({ ...valid, pickup_date: yesterday }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors)).toEqual(["pickup_date"]);
    expect(result.errors.pickup_date).toMatch(/in the past/i);
  });

  it("rejects a date that is not a real date", () => {
    const result = validateOrderInput({ ...valid, pickup_date: "2026-02-30" }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.pickup_date).toBeDefined();
  });
});

describe("T-008 a phone number with letters is rejected", () => {
  it("rejects 91234abc with a digits-spaces-plus message", () => {
    const result = validateOrderInput({ ...valid, phone: "91234abc" }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors)).toEqual(["phone"]);
    expect(result.errors.phone).toMatch(/only digits, spaces and \+/i);
  });

  it("rejects other symbols", () => {
    for (const phone of ["912-345-678", "(351) 912", "+++"]) {
      expect(validateOrderInput({ ...valid, phone }, now).ok).toBe(false);
    }
  });

  it("accepts the same form with phone +351 912 345 678", () => {
    const result = validateOrderInput({ ...valid, phone: "+351 912 345 678" }, now);
    expect(result).toEqual({ ok: true, value: valid });
  });
});

describe("T-013 (tripwire D-013) today counts as upcoming", () => {
  it("accepts a new order for today, with and without a time", () => {
    expect(validateOrderInput({ ...valid, pickup_date: today }, now).ok).toBe(true);
    expect(validateOrderInput({ ...valid, pickup_date: today, pickup_time: "09:00" }, now).ok).toBe(true);
    expect(validateOrderInput({ ...valid, pickup_date: today, pickup_time: null }, now).ok).toBe(true);
  });

  it("uses the laptop's local date, even late in the evening", () => {
    const lateEvening = new Date(2026, 9, 16, 23, 59);
    expect(validateOrderInput({ ...valid, pickup_date: today }, lateEvening).ok).toBe(true);
    expect(validateOrderInput({ ...valid, pickup_date: yesterday }, lateEvening).ok).toBe(false);
  });
});

describe("input shape", () => {
  it("rejects a bad pickup time", () => {
    const result = validateOrderInput({ ...valid, pickup_time: "25:00" }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.pickup_time).toBeDefined();
  });

  it("rejects input that is not an object", () => {
    expect(validateOrderInput(null, now).ok).toBe(false);
    expect(validateOrderInput("order", now).ok).toBe(false);
  });
});
