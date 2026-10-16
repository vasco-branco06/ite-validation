import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = path.resolve(__dirname, "../..");

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address() as net.AddressInfo;
      s.close(() => resolve(port));
    });
  });
}

/** Tries a TCP connection; resolves "connected" or the error code. */
function tryConnect(host: string, port: number): Promise<string> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, timeout: 3000 });
    socket.once("connect", () => {
      socket.destroy();
      resolve("connected");
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve("TIMEOUT");
    });
    socket.once("error", (err: NodeJS.ErrnoException) => resolve(err.code ?? err.message));
  });
}

/** The laptop's own network addresses, not loopback (link-local IPv6 needs a zone, so it is left out). */
function networkAddresses(): string[] {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((a): a is os.NetworkInterfaceInfo => !!a && !a.internal && !a.address.startsWith("fe80"))
    .map((a) => a.address);
}

describe("T-012 another device cannot open the app", () => {
  let server: ChildProcess;
  let port: number;
  let stderr = "";
  let dir: string;

  beforeAll(async () => {
    port = await freePort();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bakery-net-"));
    // The real start command (src/server.ts run directly), with the outbound watcher preloaded.
    server = spawn(
      process.execPath,
      ["--import", "tsx", "--import", "./tests/integration/fixtures/watch-outbound.mjs", "src/server.ts"],
      { cwd: root, env: { ...process.env, PORT: String(port), DB_PATH: path.join(dir, "orders.db") } },
    );
    server.stderr!.on("data", (chunk) => (stderr += chunk));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`server did not start: ${stderr}`)), 15000);
      server.stdout!.on("data", (chunk: Buffer) => {
        if (chunk.toString().includes("running at")) {
          clearTimeout(timer);
          resolve();
        }
      });
      server.once("exit", (code) => reject(new Error(`server exited with ${code}: ${stderr}`)));
    });
  }, 20000);

  afterAll(async () => {
    if (server && server.exitCode === null) {
      const exited = new Promise((resolve) => server.once("exit", resolve));
      server.kill();
      await exited;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("a second start on the same port says the app is already running and stops", async () => {
    const second = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
      cwd: root,
      env: { ...process.env, PORT: String(port), DB_PATH: path.join(dir, "orders.db") },
    });
    let output = "";
    second.stdout!.on("data", (c) => (output += c));
    second.stderr!.on("data", (c) => (output += c));
    const code = await new Promise((resolve) => second.once("exit", resolve));
    expect(code).toBe(1);
    expect(output).toMatch(/already in use/);
    expect(output).not.toMatch(/running at/);
  }, 15000);

  it("answers on 127.0.0.1", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/orders`);
    expect(res.status).toBe(200);
  });

  it("refuses a connection on the laptop's network address", async (ctx) => {
    const addresses = networkAddresses();
    if (addresses.length === 0) ctx.skip(); // no network adapter: nothing to refuse
    for (const address of addresses) {
      expect({ address, result: await tryConnect(address, port) }).toEqual({ address, result: "ECONNREFUSED" });
    }
  }, 30000); // Windows retries a refused connection for about 2 seconds per address

  it("opens no outbound connection while handling every kind of request", async () => {
    const base = `http://127.0.0.1:${port}/api/orders`;
    const json = { "Content-Type": "application/json" };
    const tomorrow = new Date(Date.now() + 86_400_000);
    const pickup_date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const input = { customer_name: "Ana", phone: "912 345 678", cake: "Lemon tart", pickup_date, pickup_time: null };

    expect((await fetch(`http://127.0.0.1:${port}/`)).status).toBe(200);
    const created = await fetch(base, { method: "POST", headers: json, body: JSON.stringify(input) });
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };
    expect((await fetch(`${base}/${id}`, { method: "PUT", headers: json, body: JSON.stringify({ ...input, cake: "Apple pie" }) })).status).toBe(200);
    expect((await fetch(`${base}/${id}/picked-up`, { method: "POST" })).status).toBe(200);
    expect((await fetch(base)).status).toBe(200);
    expect((await fetch(`${base}/${id}`, { method: "DELETE" })).status).toBe(204);

    // Binding to 127.0.0.1 itself goes through dns.lookup("127.0.0.1"); anything else is outbound.
    const outbound = stderr
      .split("\n")
      .filter((line) => line.startsWith("OUTBOUND"))
      .filter((line) => !/"(host|hostname)":"(127\.0\.0\.1|::1|localhost)"/.test(line));
    expect(stderr).toContain("OUTBOUND dns"); // the watcher is really loaded
    expect(outbound).toEqual([]);
  });
});

describe("T-012 the code has no way to call outside services", () => {
  const files = ["src", "public"].flatMap((dir) =>
    fs.readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
      .filter((f) => /\.(ts|js|html|css)$/.test(f))
      .map((f) => path.join(dir, f)),
  );

  it("finds source files to check", () => {
    expect(files.length).toBeGreaterThan(3);
  });

  it("uses no network client modules and no outside addresses", () => {
    const forbidden = [
      /from\s+["'](node:)?(http|https|net|tls|dgram|dns|http2)["']/,
      /require\(\s*["'](node:)?(http|https|net|tls|dgram|dns|http2)["']\s*\)/,
      /\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|sendBeacon/,
      /fetch\(\s*["'`]https?:/,
      /(src|href|action)\s*=\s*["']https?:/,
      /@import\s+url\(\s*["']?https?:/,
    ];
    const hits = files.flatMap((file) => {
      const text = fs.readFileSync(path.join(root, file), "utf8");
      return forbidden.filter((re) => re.test(text)).map((re) => `${file}: ${re}`);
    });
    expect(hits).toEqual([]);
  });

  it("the page only calls the app's own /api", () => {
    const app = fs.readFileSync(path.join(root, "public/app.js"), "utf8");
    const targets = [...app.matchAll(/fetch\(\s*([^,)]+)/g)].map((m) => m[1].trim());
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) expect(t).toMatch(/^(["'`]\/api\/|editingId === null \? "\/api\/)/);
  });
});
