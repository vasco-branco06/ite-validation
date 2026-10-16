import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openStore, type OrderStore } from "../../src/db";
import { OrderSchema } from "../../src/validate";

const ana = {
  customer_name: "Ana Silva",
  phone: "+351 912 345 678",
  cake: "Chocolate, 2 kg, Happy Birthday Ana",
  pickup_date: "2026-10-17",
  pickup_time: "10:30",
};
const bruno = { customer_name: "Bruno Costa", phone: "912 000 111", cake: "Lemon tart", pickup_date: "2026-10-18", pickup_time: null };
const carla = { customer_name: "Carla Reis", phone: "+44 7700 900123", cake: "Carrot cake, 1 kg", pickup_date: "2026-10-16", pickup_time: "15:00" };

let dir: string;
let dbPath: string;
let store: OrderStore | undefined;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "bakery-db-"));
  dbPath = path.join(dir, "nested", "orders.db");
});

afterEach(() => {
  store?.close();
  store = undefined;
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("order store", () => {
  it("creates the database file and its folder", () => {
    store = openStore(dbPath);
    expect(fs.existsSync(dbPath)).toBe(true);
    expect(store.list()).toEqual([]);
  });

  it("creates an order shaped as S-002", () => {
    store = openStore(dbPath);
    const order = store.create(ana);
    expect(OrderSchema.parse(order)).toEqual(order);
    expect(order).toMatchObject({ ...ana, picked_up: false });
    expect(store.list()).toEqual([order]);
    expect(store.get(order.id)).toEqual(order);
  });

  it("updates every field of an order", () => {
    store = openStore(dbPath);
    const order = store.create(ana);
    const updated = store.update(order.id, bruno);
    expect(updated).toEqual({ ...order, ...bruno });
    expect(store.list()).toEqual([updated]);
  });

  it("marks an order picked up", () => {
    store = openStore(dbPath);
    const order = store.create(ana);
    expect(store.markPickedUp(order.id)).toEqual({ ...order, picked_up: true });
    expect(store.get(order.id)?.picked_up).toBe(true);
  });

  it("deletes an order", () => {
    store = openStore(dbPath);
    const a = store.create(ana);
    const b = store.create(bruno);
    expect(store.delete(a.id)).toBe(true);
    expect(store.list()).toEqual([b]);
    expect(store.get(a.id)).toBeUndefined();
  });

  it("saves one order per submission key", () => {
    store = openStore(dbPath);
    const first = store.createOnce("key-1", ana);
    const again = store.createOnce("key-1", ana);
    expect(first.created).toBe(true);
    expect(again).toEqual({ created: false, order: first.order });
    expect(store.list()).toHaveLength(1);

    expect(store.createOnce("key-2", ana).created).toBe(true);
    expect(store.list()).toHaveLength(2);
  });

  it("does not bring back a deleted order when its key repeats", () => {
    store = openStore(dbPath);
    const { order } = store.createOnce("key-1", ana);
    store.delete(order!.id);
    expect(store.createOnce("key-1", ana)).toEqual({ created: false, order: undefined });
    expect(store.list()).toEqual([]);
  });

  it("remembers submission keys after a restart", () => {
    store = openStore(dbPath);
    store.createOnce("key-1", ana);
    store.close();
    store = openStore(dbPath);
    expect(store.createOnce("key-1", ana).created).toBe(false);
    expect(store.list()).toHaveLength(1);
  });

  it("reports a missing order", () => {
    store = openStore(dbPath);
    expect(store.get(99)).toBeUndefined();
    expect(store.update(99, ana)).toBeUndefined();
    expect(store.markPickedUp(99)).toBeUndefined();
    expect(store.delete(99)).toBe(false);
  });
});

describe("T-011 orders survive a restart", () => {
  it("shows the same three orders with the same values and picked-up status", () => {
    store = openStore(dbPath);
    store.create(ana);
    const b = store.create(bruno);
    store.create(carla);
    store.markPickedUp(b.id);
    const before = store.list();
    expect(before).toHaveLength(3);
    expect(before.filter((o) => o.picked_up).map((o) => o.id)).toEqual([b.id]);

    // Stop: close the connection, as when the app process ends.
    store.close();
    store = undefined;

    // Start again from the same file.
    store = openStore(dbPath);
    const after = store.list();
    expect(after).toEqual(before);
    for (const order of after) OrderSchema.parse(order);
  });
});

describe("T-011 in a fresh process", () => {
  it("a new app process reads the same orders from the file", () => {
    store = openStore(dbPath);
    store.create(ana);
    const b = store.create(bruno);
    store.create(carla);
    store.markPickedUp(b.id);
    const before = store.list();
    store.close();
    store = undefined;

    const script = `import { openStore } from "./src/db.ts";
const s = openStore(process.env.DB_PATH);
process.stdout.write(JSON.stringify(s.list()));
s.close();`;
    const out = execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], {
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env, DB_PATH: dbPath },
      encoding: "utf8",
    });
    expect(JSON.parse(out)).toEqual(before);
  });
});
