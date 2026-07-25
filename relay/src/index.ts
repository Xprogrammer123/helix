import 'dotenv/config';
import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import crypto from 'crypto';
import { db, DB_ID, ID, Query } from './db.js';

type RelayMessage = {
  type: 'request' | 'response';
  requestId: string;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: string;
  status?: number;
};

function rewriteHtml(body: string, name: string): string {
  const prefix = `/tunnel/${name}`;
  let rewritten = body.replace(
    /(href|src|action)=(["'])\/(?!\/|tunnel\/)/g,
    `$1=$2${prefix}/`
  );

  const swScript = `<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('${prefix}/sw.js');}</script>`;
  rewritten = rewritten.includes('</head>')
    ? rewritten.replace('</head>', `${swScript}</head>`)
    : swScript + rewritten;

  return rewritten;
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/register' });

const tunnels = new Map<string, WebSocket>();
const pending = new Map<string, (msg: RelayMessage) => void>();
const lastSeen = new Map<string, number>();

wss.on('connection',  async (ws, req) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  const name = url.searchParams.get('name');
  const token = url.searchParams.get('token');
   if (!name || !token) {
    ws.close(4001, 'Missing name or token');
    return;
  }

  const userMatch = await db.listDocuments(DB_ID, 'users', [
    Query.equal('token', token),
  ]);
  if (userMatch.total === 0) {
    ws.close(4002, 'Invalid token');
    return;
  }
  const user = userMatch.documents[0];

   const tunnelMatch = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('name', name),
  ]);

  if (tunnelMatch.total === 0) {
    // unclaimed - claim it for this user
    await db.createDocument(DB_ID, 'tunnels', ID.unique(), {
      name,
      user_id: user.$id,
    });
  } else if (tunnelMatch.documents[0].user_id !== user.$id) {
    // claimed by someone else
    ws.close(4003, 'Tunnel name already taken');
    return;
  }

  tunnels.set(name, ws);
  lastSeen.set(name, Date.now());
  console.log(`[relay] registered: ${name} (user: ${user.username})`);

  ws.on('message', (data) => {
    const msg: RelayMessage = JSON.parse(data.toString());
    lastSeen.set(name, Date.now());
    if (msg.type === 'response' && pending.has(msg.requestId)) {
      pending.get(msg.requestId)!(msg);
      pending.delete(msg.requestId);
    }
  });

  ws.on('close', () => {
    tunnels.delete(name);
    lastSeen.delete(name);
    console.log(`[relay] closed: ${name}`);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [name, ts] of lastSeen.entries()) {
    if (now - ts > 120000) {
      tunnels.get(name)?.terminate();
      tunnels.delete(name);
      lastSeen.delete(name);
      console.log(`[relay] swept dead tunnel: ${name}`);
    }
  }
}, 30000);

app.get('/tunnel/:name/sw.js', (req, res) => {
  const { name } = req.params;
  res.set('Content-Type', 'application/javascript');
  res.send(`
const PREFIX = '/tunnel/${name}';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && !url.pathname.startsWith(PREFIX) && !url.pathname.startsWith('/tunnel/')) {
    const newUrl = new URL(url);
    newUrl.pathname = PREFIX + url.pathname;
    event.respondWith(fetch(new Request(newUrl.toString(), event.request)));
    return;
  }
});
  `.trim());
});

app.use('/tunnel/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  const ws = tunnels.get(name);
  if (!ws) return res.status(404).send('Tunnel not found');

  const requestId = crypto.randomUUID();
  const path = req.originalUrl.replace(`/tunnel/${name}`, '') || '/';
  const startedAt = Date.now();

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      res.status(504).send('Tunnel timeout');
    }, 10000);

   pending.set(requestId, (msg) => {
  clearTimeout(timeout);
  res.status(msg.status || 200);

  const contentType = msg.headers?.['content-type'] || '';
  let bodyBuffer = Buffer.from(msg.body || '', 'base64');

  if (contentType.includes('text/html')) {
    const rewritten = rewriteHtml(bodyBuffer.toString('utf-8'), name);
    bodyBuffer = Buffer.from(rewritten, 'utf-8');
  }

  for (const [k, v] of Object.entries(msg.headers || {})) {
    if (['content-length', 'content-encoding', 'transfer-encoding'].includes(k.toLowerCase())) continue;
    res.set(k, v as string);
  }
  res.send(bodyBuffer);

  db.createDocument(DB_ID, 'requests', ID.unique(), {
    tunnel_name: name,
    method: req.method,
    path,
    status: msg.status || 200,
    duration_ms: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }).catch((err) => console.error('[relay] failed to log request:', err));
});

    ws.send(JSON.stringify({ type: 'request', requestId, method: req.method, path, headers: req.headers, body }));
  });
});
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string; // "cli" or "web"

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:4000/auth/github/callback',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return res.status(400).send('GitHub token exchange failed');
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const ghUser = await userRes.json();

  const existing = await db.listDocuments(DB_ID, 'users', [
    Query.equal('github_id', String(ghUser.id)),
  ]);

  let userDoc;
  if (existing.total > 0) {
    userDoc = existing.documents[0];
  } else {
    userDoc = await db.createDocument(DB_ID, 'users', ID.unique(), {
      github_id: String(ghUser.id),
      username: ghUser.login,
      token: crypto.randomUUID(),
      name: ghUser.name || ghUser.login,
    });
  }

  if (state === 'cli') {
    return res.redirect(`http://localhost:51234/callback?token=${userDoc.token}&username=${userDoc.username}`);
  }

  // web: set cookie directly, redirect to dashboard
  res.cookie('helix_token', userDoc.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  return res.redirect('http://localhost:3000/dashboard');
});

app.get('/api/requests/:name', async (req, res) => {
  const { name } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ error: 'Missing token' });

  const userMatch = await db.listDocuments(DB_ID, 'users', [
    Query.equal('token', token),
  ]);
  if (userMatch.total === 0) return res.status(401).json({ error: 'Invalid token' });
  const user = userMatch.documents[0];

  const tunnelMatch = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('name', name),
    Query.equal('user_id', user.$id),
  ]);
  if (tunnelMatch.total === 0) return res.status(403).json({ error: 'Not your tunnel' });

  const logs = await db.listDocuments(DB_ID, 'requests', [
    Query.equal('tunnel_name', name),
    Query.orderDesc('timestamp'),
    Query.limit(50),
  ]);
  res.json(logs.documents);
});

app.get('/api/tunnels', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const userMatch = await db.listDocuments(DB_ID, 'users', [
    Query.equal('token', token),
  ]);
  if (userMatch.total === 0) return res.status(401).json({ error: 'Invalid token' });
  const user = userMatch.documents[0];

  const tunnelDocs = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('user_id', user.$id),
  ]);

  const results = await Promise.all(
    tunnelDocs.documents.map(async (t) => {
      const reqCount = await db.listDocuments(DB_ID, 'requests', [
        Query.equal('tunnel_name', t.name),
        Query.limit(1), // we only need total, not the docs
      ]);
      return {
        name: t.name,
        live: tunnels.has(t.name),
        requestCount: reqCount.total,
      };
    })
  );

  res.json(results);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => console.log(`[relay] listening on ${PORT}`));