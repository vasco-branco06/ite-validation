import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openStore, type OrderStore } from "./db";
import { splitOrders } from "./sort";
import { localDateString, validateOrderInput } from "./validate";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const HOST = "127.0.0.1";
export const PORT = Number(process.env.PORT ?? 3000);

export function createApp(store: OrderStore) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(rootDir, "public")));

  app.get("/api/orders", (_req, res) => {
    res.json(splitOrders(store.list(), localDateString()));
  });

  app.post("/api/orders", (req, res) => {
    const result = validateOrderInput(req.body);
    if (!result.ok) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const key = req.get("Idempotency-Key");
    if (key === undefined) {
      res.status(201).json(store.create(result.value));
      return;
    }
    if (key.length < 1 || key.length > 100) {
      res.status(400).json({ errors: { _form: "The submission key is not valid." } });
      return;
    }
    // A repeated key is the same Save arriving again: answer with the order already saved.
    const { created, order } = store.createOnce(key, result.value);
    if (!order) {
      res.status(409).json({ errors: { _form: "This order was already saved and has since been deleted." } });
      return;
    }
    res.status(created ? 201 : 200).json(order);
  });

  app.put("/api/orders/:id", (req, res) => {
    const result = validateOrderInput(req.body);
    if (!result.ok) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const order = store.update(Number(req.params.id), result.value);
    if (!order) {
      res.status(404).json({ errors: { _form: "That order no longer exists." } });
      return;
    }
    res.json(order);
  });

  app.delete("/api/orders/:id", (req, res) => {
    if (!store.delete(Number(req.params.id))) {
      res.status(404).json({ errors: { _form: "That order no longer exists." } });
      return;
    }
    res.status(204).end();
  });

  app.post("/api/orders/:id/picked-up", (req, res) => {
    const order = store.markPickedUp(Number(req.params.id));
    if (!order) {
      res.status(404).json({ errors: { _form: "That order no longer exists." } });
      return;
    }
    res.json(order);
  });

  // Any failure reading or writing the database file (locked, read-only, disk full).
  // Every write runs in a transaction, so a failed write leaves nothing half-saved (R-014).
  app.use("/api", (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({ errors: { _form: "The order could not be read." } });
      return;
    }
    console.error(`Database error on ${req.method} ${req.path}:`, err instanceof Error ? err.message : err);
    const message =
      req.method === "GET"
        ? "The orders could not be read from the database file. Please restart the app."
        : "The database file cannot be written, so nothing was saved. Your typed order is still in the form. " +
          "Check that the laptop's disk is not full and no other program has the file open, then click Save again.";
    res.status(503).json({ errors: { _form: message } });
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const store = openStore();
  // Express 5 calls this on failure too, with the error.
  createApp(store).listen(PORT, HOST, (err?: Error) => {
    if (err) {
      const inUse = (err as NodeJS.ErrnoException).code === "EADDRINUSE";
      console.error(
        inUse
          ? `Could not start: address already in use. The app is probably already running in another window - open http://${HOST}:${PORT}`
          : `Could not start: ${err.message}`,
      );
      store.close();
      process.exit(1);
    }
    console.log(`Bakery Cake Orders running at http://${HOST}:${PORT}`);
  });
}
