import Database from "better-sqlite3";

/** Today plus offsetDays, as the laptop's local YYYY-MM-DD. */
export function localDate(offsetDays = 0, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Days from today to the next given weekday (0 = Sunday), strictly after today. */
export function daysUntilNext(weekday: number, from = new Date()): number {
  return (weekday - from.getDay() + 7) % 7 || 7;
}

/** Days from today back to the last given weekday, strictly before today. */
export function daysSinceLast(weekday: number, from = new Date()): number {
  return (from.getDay() - weekday + 7) % 7 || 7;
}

function withDb<T>(fn: (db: Database.Database) => T): T {
  const db = new Database(process.env.E2E_DB_PATH!);
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

/** Removes every order. The server created the table when it started. */
export function resetDb(): void {
  withDb((db) => db.exec("DELETE FROM orders; DELETE FROM submissions;"));
}

export function countOrders(): number {
  return withDb((db) => (db.prepare("SELECT COUNT(*) AS n FROM orders").get() as { n: number }).n);
}

/** customer_name -> picked_up, straight from the database. */
export function pickedUpByName(): Record<string, boolean> {
  return withDb((db) => {
    const rows = db.prepare("SELECT customer_name, picked_up FROM orders").all() as { customer_name: string; picked_up: number }[];
    return Object.fromEntries(rows.map((r) => [r.customer_name, r.picked_up === 1]));
  });
}

/** Every stored order, as raw database rows. */
export function allOrders(): { id: number; customer_name: string; pickup_date: string; pickup_time: string | null }[] {
  return withDb((db) => db.prepare("SELECT * FROM orders ORDER BY id").all() as never);
}

export type SeedOrder = {
  customer_name: string;
  pickup_date: string;
  pickup_time?: string | null;
  picked_up?: boolean;
  phone?: string;
  cake?: string;
};

/** Writes an order straight into the database, so tests can have orders dated in the past. */
export function seedOrder(o: SeedOrder): void {
  withDb((db) =>
    db
      .prepare(
        `INSERT INTO orders (customer_name, phone, cake, pickup_date, pickup_time, picked_up, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        o.customer_name,
        o.phone ?? "912 345 678",
        o.cake ?? "Sponge cake",
        o.pickup_date,
        o.pickup_time ?? null,
        o.picked_up ? 1 : 0,
        new Date().toISOString(),
      ),
  );
}
