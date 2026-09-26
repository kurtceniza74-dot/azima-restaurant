// End-to-end smoke test: boots `next start`, checks the rendered page and the order API flow.
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 3123;
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn('cmd.exe', ['/c', `npm run dev -- -p ${PORT}`], {
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  let lastError = 'no attempt made';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const res = await fetch(BASE + '/', { cache: 'no-store', redirect: 'manual' });
      if (res.status >= 200 && res.status < 400) return true;
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await sleep(500);
  }
  console.log('last boot error:', lastError);
  return false;
}

function report(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ->  ${detail}` : ''}`);
  return ok;
}

try {
  const up = await waitForServer();
  report('server boot', up);
  if (!up) {
    console.log(serverLog.slice(-2000));
    process.exit(1);
  }

  const page = await fetch(BASE + '/', { cache: 'no-store' });
  const html = await page.text();
  const htmlChecks = [
    ['hero headline', 'What sounds good today?'],
    ['menu section heading', 'Find your favourite'],
    ['menu categories', 'Pastries &amp; Desserts'],
    ['gallery link', 'href="/gallery"'],
    ['reviews link', 'href="/reviews"'],
    ['bottom nav', 'App navigation'],
    ['category dropdown trigger', 'aria-haspopup="listbox"'],
    ['macOS menu bar', 'aria-label="Main navigation"'],
  ];
  for (const [label, needle] of htmlChecks) {
    report(`page HTML contains: ${label}`, html.includes(needle));
  }

  const legalPages = [
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Website Terms'],
    ['/accessibility', 'Accessibility'],
    ['/gallery', 'Rogers'],
    ['/reviews', 'Google Maps'],
  ];
  for (const [path, needle] of legalPages) {
    const legalRes = await fetch(BASE + path, { cache: 'no-store' });
    const legalHtml = await legalRes.text();
    report(`legal page renders: ${path}`, legalRes.ok && legalHtml.includes(needle), `HTTP ${legalRes.status}`);
  }

  const scriptSrcs = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((match) => match[1]);
  let bundle = '';
  for (const src of new Set(scriptSrcs)) {
    const chunk = await fetch(BASE + src, { cache: 'no-store' });
    if (chunk.ok) bundle += await chunk.text();
  }
  const bundleChecks = [
    ['hospitality heading', 'Hospitality & Services'],
    ['gallery preview', 'View gallery'],
    ['reviews section', 'What guests say'],
    ['map code row', 'Map code'],
    ['order review pill', 'Review Order'],
    ['auto-opening cart panel', 'Your cart'],
    ['cart item stepper label', 'each ·'],
    ['cart clear action', 'Clear cart'],
    ['cart collapse control', 'Collapse cart'],
    ['order stepper', 'Delivered'],
    ['category dropdown portal layer', 'fixed z-[120]'],
    ['category dropdown listbox label', 'Menu categories'],
  ];
  console.log(`client bundle chunks loaded: ${new Set(scriptSrcs).size}, bytes: ${bundle.length}`);
  for (const [label, needle] of bundleChecks) {
    report(`client bundle contains: ${label}`, bundle.includes(needle));
  }

  const createRes = await fetch(BASE + '/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ fulfillment: 'Dine in', items: [{ id: 'flat-white', quantity: 2 }] }),
  });
  const created = await createRes.json();
  const cookies = (createRes.headers.getSetCookie?.() ?? [])
    .map((value) => value.split(';')[0])
    .join('; ');
  report('POST /api/orders', createRes.ok && Boolean(created.order?.code) && typeof created.csrfToken === 'string', `code=${created.order?.code ?? created.error} cookies=${cookies ? 'yes' : 'no'}`);

  if (created.order?.code) {
    const submitRes = await fetch(`${BASE}/api/orders/${encodeURIComponent(created.order.code)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': created.csrfToken,
        Origin: BASE,
        cookie: cookies,
      },
      body: JSON.stringify({ action: 'submit' }),
    });
    const submitted = await submitRes.json();
    report('PATCH submit', submitRes.ok && submitted.order?.status === 'submitted', `status=${submitted.order?.status ?? submitted.error}`);

    const statusRes = await fetch(`${BASE}/api/orders/${encodeURIComponent(created.order.code)}`, {
      cache: 'no-store',
      headers: { cookie: cookies },
    });
    const statusData = await statusRes.json();
    report('GET order status (polling)', statusRes.ok && statusData.order?.code === created.order.code, `status=${statusData.order?.status ?? statusData.error}`);

    const adminRes = await fetch(`${BASE}/api/admin/orders`, { cache: 'no-store' });
    report('admin queue reachable', adminRes.status === 401 || adminRes.ok, `HTTP ${adminRes.status}`);

    const forgedPayload = Buffer.from(
      JSON.stringify({ username: 'admin', expiresAt: Date.now() + 3600_000, csrfToken: 'forged' })
    ).toString('base64url');
    const forgedSignature = createHmac('sha256', 'fallback-secret-at-least-32-chars-long')
      .update(forgedPayload)
      .digest('base64url');
    const forgedRes = await fetch(`${BASE}/api/admin/orders`, {
      cache: 'no-store',
      headers: { cookie: `rogers-admin-session=${forgedPayload}.${forgedSignature}` },
    });
    report('admin cookie signed with a known key is rejected', forgedRes.status === 401, `HTTP ${forgedRes.status}`);

    const adminSession = await (await fetch(`${BASE}/api/admin/session`, { cache: 'no-store' })).json();
    report('admin session endpoint answers', typeof adminSession.configured === 'boolean', `configured=${adminSession.configured}`);

    // A fresh unique rate-limit identity keeps repeated smoke-test runs from exhausting the login bucket.
    const loginIp = `198.51.100.${1 + Math.floor(Math.random() * 254)}`;
    const badLogin = await fetch(`${BASE}/api/admin/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE, 'x-forwarded-for': loginIp },
      body: JSON.stringify({ username: 'admin', password: 'not-the-admin-password' }),
    });
    const expectedBadLogin = adminSession.configured ? 401 : 503;
    report('admin login rejects a wrong password', badLogin.status === expectedBadLogin, `HTTP ${badLogin.status}`);

    const legacyStore = join(process.cwd(), 'lib', 'admin-credentials.json');
    report('admin secrets live outside the source tree', !existsSync(legacyStore), legacyStore);
  }
} catch (error) {
  console.log('FAIL  unexpected error ->', error instanceof Error ? error.message : error);
} finally {
  if (server.pid) {
    try {
      spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } catch {
      server.kill();
    }
  }
  await sleep(800);
  process.exit(0);
}
