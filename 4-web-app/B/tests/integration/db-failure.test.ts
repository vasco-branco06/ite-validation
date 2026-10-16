import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { openStore, type OrderStore } from "../../src/db";
import { createApp } from "../../src/server";

const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();
const first = { customer_name: "First", phone: "912 345 678", cake: "Sponge", pickup_date: tomorrow, pickup_time: null };
const second = { customer_name: "Second", phone: "912 000 000", cake: "Lemon tart", pickup_date: tomorrow, pickup_time: "11:00" };

let dir: string;
let dbPath: string;
let store: OrderStore | undefined;
let server: Server | undefined;
let base: string;

function countOrders(): number {
  const db = new Database(dbPath, { readonly: true });
  try {
    return (db.prepare("SELECT COUNT(*) AS n FROM orders").get() as { n: number }).n;
  } finally {
    db.close();
  }
}

async function start() {
  store = openStore(dbPath);
  server = createApp(store).listen(0, "127.0.0.1");
  await new Promise((r) => server!.once("listening", r));
  base = `http://127.0.0.1:${(server!.address() as AddressInfo).port}/api/orders`;
}

function save(body: object, key?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key) headers["Idempotency-Key"] = key;
  return fetch(base, { method: "POST", headers, body: JSON.stringify(body) });
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "bakery-fail-"));
  dbPath = path.join(dir, "orders.db");
});

afterEach(async () => {
  if (server) await new Promise((r) => server!.close(r));
  server = undefined;
  store?.close();
  store = undefined;
  if (fs.existsSync(dbPath)) fs.chmodSync(dbPath, 0o666);
  fs.rmSync(dir, { recursive: true, force: true });
});

const CLEAR_ERROR = /database.*cannot be written.*nothing was saved/i;

describe("T-010 an unwritable database shows an error and stores nothing", () => {
  it("database file locked by another program", async () => {
    await start();
    expect((await save(first, "k1")).status).toBe(201);

    // Another program holds the file locked, so the app cannot write.
    const other = new Database(dbPath);
    other.exec("BEGIN EXCLUSIVE");
    try {
      const res = await save(second, "k2");
      expect(res.status).toBe(503);
      expect((await res.json()).errors._form).toMatch(CLEAR_ERROR);
    } finally {
      other.exec("ROLLBACK");
      other.close();
    }
    expect(countOrders()).toBe(1);

    // Once the file is free again, the same Save (same key) goes through, once.
    expect((await save(second, "k2")).status).toBe(201);
    expect((await save(second, "k2")).status).toBe(200);
    expect(countOrders()).toBe(2);
  }, 15000);

  it("database file made read-only", async () => {
    store = openStore(dbPath);
    store.create(first);
    store.close();
    store = undefined;
    fs.chmodSync(dbPath, 0o444);

    await start();
    expect((await fetch(base)).status).toBe(200); // reading still works
    const res = await save(second, "k2");
    expect(res.status).toBe(503);
    expect((await res.json()).errors._form).toMatch(CLEAR_ERROR);
    expect(countOrders()).toBe(1);
  });

  it("a write that fails half-way leaves no partial order", async () => {
    await start();
    expect((await save(first, "k1")).status).toBe(201);

    // Make the second half of a create (recording the submission key) fail.
    const other = new Database(dbPath);
    other.exec(`CREATE TRIGGER fail_submissions BEFORE INSERT ON submissions BEGIN SELECT RAISE(ABORT, 'disk I/O error'); END;`);
    other.close();

    const res = await save(second, "k2");
    expect(res.status).toBe(503);
    expect((await res.json()).errors._form).toMatch(CLEAR_ERROR);
    expect(countOrders()).toBe(1);
  });

  it("edit, picked up and delete report the same clear error", async () => {
    await start();
    const { id } = (await (await save(first, "k1")).json()) as { id: number };
    fs.chmodSync(dbPath, 0o444);
    store!.close();
    server!.close();
    await start();

    const json = { "Content-Type": "application/json" };
    const responses = [
      await fetch(`${base}/${id}`, { method: "PUT", headers: json, body: JSON.stringify(second) }),
      await fetch(`${base}/${id}/picked-up`, { method: "POST" }),
      await fetch(`${base}/${id}`, { method: "DELETE" }),
    ];
    for (const res of responses) {
      expect(res.status).toBe(503);
      expect((await res.json()).errors._form).toMatch(/database.*cannot be written/i);
    }
    fs.chmodSync(dbPath, 0o666);
    const db = new Database(dbPath, { readonly: true });
    expect(db.prepare("SELECT customer_name, picked_up FROM orders").all()).toEqual([{ customer_name: "First", picked_up: 0 }]);
    db.close();
  });
});
