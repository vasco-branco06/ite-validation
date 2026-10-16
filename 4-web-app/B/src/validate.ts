import { OrderInputSchema, type OrderInput } from "../schemas/S-001-order-input.zod";
import { OrderSchema, type Order } from "../schemas/S-002-order.zod";

export { OrderInputSchema, OrderSchema };
export type { OrderInput, Order };

/** A validated order input; pickup_time is always present, null when not given. */
export type ValidOrderInput = Omit<OrderInput, "pickup_time"> & { pickup_time: string | null };

/** Field name -> message. "_form" is used when the input is not an order at all. */
export type FieldErrors = Partial<Record<keyof OrderInput | "_form", string>>;

export type ValidationResult =
  | { ok: true; value: ValidOrderInput }
  | { ok: false; errors: FieldErrors };

const REQUIRED = ["customer_name", "phone", "cake", "pickup_date"] as const;

const MESSAGES: Record<keyof OrderInput, string> = {
  customer_name: "Customer name is required.",
  phone: "Phone may contain only digits, spaces and +.",
  cake: "Cake is required.",
  pickup_date: "Pickup date must be a real date (YYYY-MM-DD).",
  pickup_time: "Pickup time must be HH:MM.",
};

const REQUIRED_MESSAGES: Record<(typeof REQUIRED)[number], string> = {
  customer_name: "Customer name is required.",
  phone: "Phone is required.",
  cake: "Cake is required.",
  pickup_date: "Pickup date is required.",
};

/** The laptop's local date as YYYY-MM-DD (D-013). */
export function localDateString(now: Date = new Date()): string {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

/**
 * Checks an order from the form against S-001, plus the rule that the pickup
 * date is not before today's local date (D-013: today is accepted).
 */
export function validateOrderInput(input: unknown, now: Date = new Date()): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: { _form: "The order could not be read." } };
  }

  const raw = { ...(input as Record<string, unknown>) };
  // An empty time box means "no time".
  if (raw.pickup_time === "" || raw.pickup_time === undefined) raw.pickup_time = null;

  const errors: FieldErrors = {};
  for (const field of REQUIRED) {
    if (isBlank(raw[field])) errors[field] = REQUIRED_MESSAGES[field];
  }

  const parsed = OrderInputSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in MESSAGES) {
        const key = field as keyof OrderInput;
        errors[key] ??= MESSAGES[key];
      } else {
        errors._form ??= "The order has fields the form does not know.";
      }
    }
  }

  if (!errors.pickup_date && typeof raw.pickup_date === "string" && raw.pickup_date < localDateString(now)) {
    errors.pickup_date = "Pickup date is in the past.";
  }

  if (Object.keys(errors).length > 0 || !parsed.success) return { ok: false, errors };
  return { ok: true, value: { ...parsed.data, pickup_time: parsed.data.pickup_time ?? null } };
}
