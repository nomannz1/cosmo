/**
 * Minimal token server: holds COSMO_API_KEY and mints short-lived end-user
 * JWTs for the browser app. Mirrors the official examples/typescript/token-server
 * (https://github.com/socratic-ai/cosmo-ai/tree/main/examples/typescript/token-server).
 *
 * Auth (dev mode): callers send `Authorization: Bearer <MINT_SECRET>`.
 * In production, replace `identifyUser()` with your real auth and return a
 * stable per-user id.
 */

const COSMO_API_KEY = process.env.COSMO_API_KEY;
const MINT_SECRET = process.env.MINT_SECRET;
const COSMO_BASE_URL = process.env.COSMO_BASE_URL ?? 'https://platform.askcosmo.ai';
const PORT = Number(process.env.PORT ?? 8787);

if (!COSMO_API_KEY) {
  console.error('COSMO_API_KEY is required (see .env.example)');
  process.exit(1);
}
if (!MINT_SECRET) {
  console.error('MINT_SECRET is required (see .env.example)');
  process.exit(1);
}

/** Returns a stable id for the caller, or null to reject. Replace with real auth. */
function identifyUser(req: Request): string | null {
  if (req.headers.get('authorization') !== `Bearer ${MINT_SECRET}`) return null;
  return req.headers.get('x-external-user-id') ?? process.env.EXTERNAL_USER_ID ?? 'demo-user';
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

async function handleToken(req: Request): Promise<Response> {
  const userId = identifyUser(req);
  if (!userId) return json({ error: 'unauthorized' }, 401);

  const upstream = await fetch(`${COSMO_BASE_URL}/api/v1/external/auth/token`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${COSMO_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ external_user_id: userId }),
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

// Node 18+ built-in HTTP adapter around the fetch-style handler.
import { createServer } from 'node:http';

createServer(async (nodeReq, nodeRes) => {
  const url = new URL(nodeReq.url ?? '/', `http://localhost:${PORT}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers)) {
    if (typeof v === 'string') headers.set(k, v);
  }
  const req = new Request(url, { method: nodeReq.method, headers });

  let res: Response;
  if (req.method === 'POST' && url.pathname === '/token') {
    res = await handleToken(req);
  } else if (req.method === 'GET' && url.pathname === '/health') {
    res = json({ ok: true });
  } else {
    res = json({ error: 'not_found' }, 404);
  }

  nodeRes.writeHead(res.status, Object.fromEntries(res.headers));
  nodeRes.end(await res.text());
}).listen(PORT, () => {
  console.log(`[token-server] listening on http://localhost:${PORT}`);
});
