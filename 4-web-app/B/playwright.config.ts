import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The main Playwright process picks one temporary database file and starts it empty;
// workers inherit the path through the environment.
if (!process.env.E2E_DB_PATH) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bakery-e2e-"));
  process.env.E2E_DB_PATH = path.join(dir, "orders.db");
}

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx tsx src/server.ts",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    env: { DB_PATH: process.env.E2E_DB_PATH },
  },
});
