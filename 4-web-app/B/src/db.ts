import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Order, ValidOrderInput } from "./validate";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** data/orders.db in the app folder, unless DB_PATH says otherwise (used by tests). */
export const DEFAULT_DB_PATH = process.env.DB_PATH ?? path.join(rootDir, "data", "orders.db");

type OrderRow = {
  id: number;
  customer_name: string;
  phone: string;
  cake: string;
  pickup_date: string;
  pickup_time: string | null;
  picked_up: number;
  created_at: string;
};

export interface OrderStore {
  list(): Order[];
  get(id: number): Order | undefined;
  create(input: ValidOrderInput): Order;
  /**
   * Creates the order unless this submission key was used before; then returns the
   * order it created (undefined if that order has since been deleted).
   */
  createOnce(key: string, input: ValidOrderInput): { created: boolean; order: Order | undefined };
  update(id: number, input: ValidOrderInput): Order | undefined;
  markPickedUp(id: number): Order | undefined;
  delete(id: number): boolean;
  close(): void;
}

function toOrder(row: OrderRow): Order {
  return { ...row, picked_up: row.picked_up === 1 };
}

export function openStore(dbPath: string = DEFAULT_DB_PATH): OrderStore {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  // Wait at most 2 s for another program to release the file, then report the error.
  const db = new Database(dbPath, { timeout: 2000 });
  // Rollback journal (no -wal side file) so the backup is a single file; FULL sync so a saved order is on disk.
  db.pragma("journal_mode = DELETE");
  db.pragma("synchronous = FULL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT    NOT NULL,
      phone         TEXT    NOT NULL,
      cake          TEXT    NOT NULL,
      pickup_date   TEXT    NOT NULL,
      pickup_time   TEXT,
      picked_up     INTEGER NOT NULL DEFAULT 0 CHECK (picked_up IN (0, 1)),
      created_at    TEXT    NOT NULL
    );
    -- One row per form submission key, so a repeated Save creates no second order (R-013).
    -- Kept after the order is deleted, so a late repeat cannot bring it back.
    CREATE TABLE IF NOT EXISTS submissions (
      key      TEXT    PRIMARY KEY,
      order_id INTEGER NOT NULL
    );
  `);

  const selectAll = db.prepare<[], OrderRow>("SELECT * FROM orders ORDER BY id");
  const selectOne = db.prepare<[number], OrderRow>("SELECT * FROM orders WHERE id = ?");
  const insert = db.prepare(
    `INSERT INTO orders (customer_name, phone, cake, pickup_date, pickup_time, picked_up, created_at)
     VALUES (@customer_name, @phone, @cake, @pickup_date, @pickup_time, 0, @created_at)`,
  );
  const updateOne = db.prepare(
    `UPDATE orders SET customer_name = @customer_name, phone = @phone, cake = @cake,
       pickup_date = @pickup_date, pickup_time = @pickup_time WHERE id = @id`,
  );
  const pickUp = db.prepare("UPDATE orders SET picked_up = 1 WHERE id = ?");
  const deleteOne = db.prepare("DELETE FROM orders WHERE id = ?");
  const selectSubmission = db.prepare<[string], { order_id: number }>("SELECT order_id FROM submissions WHERE key = ?");
  const insertSubmission = db.prepare("INSERT INTO submissions (key, order_id) VALUES (?, ?)");

  const get = (id: number): Order | undefined => {
    const row = selectOne.get(id);
    return row ? toOrder(row) : undefined;
  };

  const fields = (input: ValidOrderInput) => ({
    customer_name: input.customer_name,
    phone: input.phone,
    cake: input.cake,
    pickup_date: input.pickup_date,
    pickup_time: input.pickup_time ?? null,
  });

  const create = db.transaction((input: ValidOrderInput): Order => {
    const info = insert.run({ ...fields(input), created_at: new Date().toISOString() });
    return get(Number(info.lastInsertRowid))!;
  });

  const createOnce = db.transaction((key: string, input: ValidOrderInput) => {
    const seen = selectSubmission.get(key);
    if (seen) return { created: false, order: get(seen.order_id) };
    const order = create(input);
    insertSubmission.run(key, order.id);
    return { created: true, order };
  });

  const update = db.transaction((id: number, input: ValidOrderInput): Order | undefined => {
    const info = updateOne.run({ ...fields(input), id });
    return info.changes === 1 ? get(id) : undefined;
  });

  const markPickedUp = db.transaction((id: number): Order | undefined => {
    const info = pickUp.run(id);
    return info.changes === 1 ? get(id) : undefined;
  });

  const remove = db.transaction((id: number): boolean => deleteOne.run(id).changes === 1);

  return {
    list: () => selectAll.all().map(toOrder),
    get,
    create,
    createOnce,
    update,
    markPickedUp,
    delete: remove,
    close: () => db.close(),
  };
}
