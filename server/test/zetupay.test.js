import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.VERCEL = '1';
process.env.ZETUPAY_SECRET_KEY = '';
process.env.ZETUPAY_PUBLIC_KEY = '';

const { default: app } = await import('../src/server.js');

let server;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});

test('zetupay payment route requires configured keys', async () => {
  const address = server.address();
  const port = address.port;

  const response = await fetch(`http://127.0.0.1:${port}/api/payments/zetupay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 300, phoneNumber: '254700000000', reference: 'TEST-001' })
  });

  assert.notEqual(response.status, 404);
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.match(payload.message, /secret key is not configured/i);
});

test('server allows the active Vite localhost origin for browser requests', async () => {
  const address = server.address();
  const port = address.port;

  const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
    headers: {
      Origin: 'http://localhost:5174'
    }
  });

  assert.equal(response.status, 200);
  assert.ok(
    response.headers.get('access-control-allow-origin') === 'http://localhost:5174' ||
    response.headers.get('access-control-allow-origin') === '*'
  );
});

test('sqlite database URLs fall back to demo mode instead of crashing', async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'sqlite:///db.sqlite3';

  const moduleUrl = pathToFileURL(path.resolve(import.meta.dirname, '../src/server.js')).href + '?sqlite=' + Date.now();
  const { default: sqliteApp } = await import(moduleUrl);

  const sqliteServer = http.createServer(sqliteApp);
  await new Promise((resolve) => sqliteServer.listen(0, resolve));

  try {
    const address = sqliteServer.address();
    const port = address.port;

    const response = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SQLite User',
        email: 'sqlite-user@example.com',
        password: 'password123',
        role: 'student'
      })
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.match(payload.message, /Account created/i);
  } finally {
    await new Promise((resolve, reject) => sqliteServer.close((err) => err ? reject(err) : resolve()));
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  }
});
