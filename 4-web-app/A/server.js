// Guestbook: single-page app backed by SQLite (node:sqlite, no dependencies).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.db');
const INDEX_HTML = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));

const db = new DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

const listEntries = db.prepare('SELECT * FROM entries ORDER BY id DESC');
const insertEntry = db.prepare(
  'INSERT INTO entries (name, email, message) VALUES (?, ?, ?) RETURNING *'
);
const deleteEntry = db.prepare('DELETE FROM entries WHERE id = ?');

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e5) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function validate({ name, email, message }) {
  const errors = {};
  name = typeof name === 'string' ? name.trim() : '';
  email = typeof email === 'string' ? email.trim() : '';
  message = typeof message === 'string' ? message.trim() : '';
  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be at most 100 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'A valid email is required';
  if (!message) errors.message = 'Message is required';
  else if (message.length > 1000) errors.message = 'Message must be at most 1000 characters';
  return { errors, value: { name, email, message } };
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  try {
    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(INDEX_HTML);
    }

    if (pathname === '/api/entries') {
      if (req.method === 'GET') return sendJson(res, 200, listEntries.all());
      if (req.method === 'POST') {
        const { errors, value } = validate(await readJson(req));
        if (Object.keys(errors).length) return sendJson(res, 400, { errors });
        return sendJson(res, 201, insertEntry.get(value.name, value.email, value.message));
      }
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const match = pathname.match(/^\/api\/entries\/(\d+)$/);
    if (match && req.method === 'DELETE') {
      const { changes } = deleteEntry.run(Number(match[1]));
      return changes ? sendJson(res, 204) : sendJson(res, 404, { error: 'Not found' });
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
