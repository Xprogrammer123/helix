import 'dotenv/config';
import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { WebSocketServer as WSServer } from 'ws';
import { db, DB_ID, ID, Query } from './db.js';
import {
  type UserDoc,
  isPro,
  historyLimit,
  idleTtlMs,
  FREE_HISTORY_LIMIT,
} from './plan.js';

type RelayMessage = {
  type: 'request' | 'response';
  requestId: string;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: string;
  status?: number;
};

type TunnelMeta = {
  userId: string;
  passwordHash?: string;
  idleTtlMs: number;
};

import { auth, emailDelivery } from './auth.js';
import { resolveUserFromAuth, findOrCreateUserFromRadon } from './users.js';
import {
  RELAY_URL,
  DASHBOARD_URL,
  UPGRADE_URL,
  upgradeHint,
  freeTierTip,
} from './config.js';
import { publish, subscribeDashboard } from './events.js';
import {
  checkoutIdFromRaw,
  metadataUserId,
  payments,
  paymentsConfigured,
  proAmount,
  webhookHeaders,
} from './payments.js';

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

function unregisterTunnel(name: string, ws?: WebSocket) {
  if (ws && tunnels.get(name) !== ws) return;
  const meta = tunnelMeta.get(name);
  tunnels.delete(name);
  lastSeen.delete(name);
  tunnelMeta.delete(name);
  if (meta) publish(meta.userId, { type: 'tunnel.offline', name });
}

function countActiveTunnelsForUser(userId: string, excludeName?: string): number {
  let count = 0;
  for (const [name, meta] of tunnelMeta.entries()) {
    if (meta.userId === userId && name !== excludeName && tunnels.has(name)) {
      count++;
    }
  }
  return count;
}

async function verifyTunnelPassword(
  req: Request,
  res: Response,
  passwordHash: string
): Promise<boolean> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Helix Tunnel"');
    res.status(401).send('Authentication required');
    return false;
  }
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
  const colonIdx = decoded.indexOf(':');
  const password = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
  const ok = await bcrypt.compare(password, passwordHash);
  if (!ok) {
    res.set('WWW-Authenticate', 'Basic realm="Helix Tunnel"');
    res.status(401).send('Invalid credentials');
    return false;
  }
  return true;
}

function userPublicProfile(user: UserDoc) {
  const pro = isPro(user);
  return {
    username: user.username,
    name: user.name,
    plan: pro ? 'pro' : 'free',
    plan_expires_at: user.plan_expires_at ?? null,
    isPro: pro,
  };
}

function extendPlanExpiry(from?: string | null): string {
  const base = from && new Date(from) > new Date() ? new Date(from) : new Date();
  base.setDate(base.getDate() + 30);
  return base.toISOString();
}

async function activatePro(userId: string, customerId?: string, subscriptionId?: string) {
  const userDoc = await db.getDocument(DB_ID, 'users', userId);
  const updates: Record<string, unknown> = {
    plan: 'pro',
    plan_expires_at: extendPlanExpiry(userDoc.plan_expires_at as string | undefined),
  };
  if (customerId) updates.bachs_customer_id = customerId;
  if (subscriptionId) updates.bachs_subscription_id = subscriptionId;
  await db.updateDocument(DB_ID, 'users', userId, updates);
}

const app = express();
app.set('trust proxy', 1);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post(
  ['/webhooks/payments', '/webhooks/bachs'],
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!paymentsConfigured()) return res.status(503).send('Not configured');

    try {
      const event = await payments.webhooks.handle(
        { body: req.body as Buffer, headers: webhookHeaders(req.headers) },
        { provider: 'bachs' }
      );

      const raw = event.raw as Record<string, unknown> | undefined;
      const data = (raw?.data ?? {}) as Record<string, unknown>;

      if (
        event.type === 'payment.succeeded' ||
        event.providerEventType === 'checkout.completed'
      ) {
        const userId = metadataUserId(raw) ?? metadataUserId(data);
        const customer = data.customer as { customer_id?: string; id?: string } | undefined;
        const subscription = data.subscription as { subscription_id?: string } | null;
        if (userId) {
          await activatePro(
            userId,
            customer?.customer_id || customer?.id,
            subscription?.subscription_id
          );
        }
      } else if (event.type === 'subscription.cancelled') {
        const subId =
          event.objectId ||
          (data.subscription_id as string | undefined) ||
          ((data.subscription as { subscription_id?: string } | undefined)?.subscription_id);
        if (subId) {
          const users = await db.listDocuments(DB_ID, 'users', [
            Query.equal('bachs_subscription_id', subId),
          ]);
          if (users.total > 0) {
            await db.updateDocument(DB_ID, 'users', users.documents[0].$id, { plan: 'free' });
          }
        }
      }
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'webhook_signature_invalid') {
        return res.status(400).send('Invalid signature');
      }
      console.error('[relay] payments webhook error:', err);
      return res.status(500).send('Handler error');
    }

    res.send('OK');
  }
);

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/register' });

const tunnels = new Map<string, WebSocket>();
const pending = new Map<string, (msg: RelayMessage) => void>();
const lastSeen = new Map<string, number>();
const tunnelMeta = new Map<string, TunnelMeta>();

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url ?? '', RELAY_URL);
  const name = url.searchParams.get('name');
  const token = url.searchParams.get('token');
  const password = url.searchParams.get('password');

  if (!name || !token) {
    ws.close(4001, 'Missing name or token');
    return;
  }

  const user = await resolveUserFromAuth(token);
  if (!user) {
    ws.close(4002, 'Invalid token');
    return;
  }

  const userIsPro = isPro(user);

  if (!userIsPro) {
    const activeOthers = countActiveTunnelsForUser(user.$id, name);
    if (activeOthers >= 1) {
      ws.close(
        4004,
        'Free plan allows 1 active tunnel. ' + upgradeHint()
      );
      return;
    }
  }

  if (password && !userIsPro) {
    ws.close(4005, 'Password-protected tunnels require Helix Pro.');
    return;
  }

  const tunnelMatch = await db.listDocuments(DB_ID, 'tunnels', [Query.equal('name', name)]);

  let tunnelDoc;
  if (tunnelMatch.total === 0) {
    tunnelDoc = await db.createDocument(DB_ID, 'tunnels', ID.unique(), {
      name,
      user_id: user.$id,
    });
  } else if (tunnelMatch.documents[0].user_id !== user.$id) {
    ws.close(4003, 'Tunnel name already taken');
    return;
  } else {
    tunnelDoc = tunnelMatch.documents[0];
  }

  let passwordHash = tunnelDoc.password_hash as string | undefined;

  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
    await db.updateDocument(DB_ID, 'tunnels', tunnelDoc.$id, {
      password_hash: passwordHash,
    });
  }

  tunnelMeta.set(name, {
    userId: user.$id,
    passwordHash,
    idleTtlMs: idleTtlMs(user),
  });

  const existingWs = tunnels.get(name);
  tunnels.set(name, ws);
  lastSeen.set(name, Date.now());
  if (existingWs && existingWs !== ws) existingWs.terminate();
  publish(user.$id, { type: 'tunnel.live', name });
  console.log(`[relay] registered: ${name} (user: ${user.username})`);

  ws.send(
    JSON.stringify({
      type: 'connected',
      plan: userIsPro ? 'pro' : 'free',
      tip: userIsPro ? null : freeTierTip(),
    })
  );

  ws.on('message', (data) => {
    const msg: any = JSON.parse(data.toString());
    lastSeen.set(name, Date.now());

    if (msg.type === 'response' && pending.has(msg.requestId)) {
      pending.get(msg.requestId)!(msg);
      pending.delete(msg.requestId);
      return;
    }

    if (msg.type === 'ws-message') {
      const browserWs = browserSockets.get(msg.connectionId);
      if (browserWs && browserWs.readyState === WebSocket.OPEN) {
        browserWs.send(Buffer.from(msg.data, 'base64'), { binary: msg.isBinary });
      }
      return;
    }

    if (msg.type === 'ws-close') {
      const browserWs = browserSockets.get(msg.connectionId);
      browserWs?.close();
      browserSockets.delete(msg.connectionId);
    }
  });

  ws.on('close', () => {
    unregisterTunnel(name, ws);
    console.log(`[relay] closed: ${name}`);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [name, ts] of lastSeen.entries()) {
    const ttl = tunnelMeta.get(name)?.idleTtlMs ?? 120_000;
    if (now - ts > ttl) {
      const dead = tunnels.get(name);
      unregisterTunnel(name, dead);
      dead?.terminate();
      console.log(`[relay] swept dead tunnel: ${name}`);
    }
  }
}, 30_000);

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

app.use('/tunnel/:name', async (req: Request, res: Response) => {
  const name = String(req.params.name);
  const ws = tunnels.get(name);
  if (!ws) return res.status(404).send('Tunnel not found');

  const meta = tunnelMeta.get(name);
  if (meta?.passwordHash) {
    const ok = await verifyTunnelPassword(req, res, meta.passwordHash);
    if (!ok) return;
  }

  const requestId = crypto.randomUUID();
  const path = req.originalUrl.replace(`/tunnel/${name}`, '') || '/';
  const startedAt = Date.now();

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      res.status(504).send('Tunnel timeout');
    }, 10_000);

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
        if (['content-length', 'content-encoding', 'transfer-encoding'].includes(k.toLowerCase()))
          continue;
        res.set(k, v as string);
      }
      res.send(bodyBuffer);

      const requestLog = {
        $id: ID.unique(),
        tunnel_name: name,
        method: req.method,
        path,
        status: msg.status || 200,
        duration_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      };

      if (meta) publish(meta.userId, { type: 'request', request: requestLog });

      db.createDocument(DB_ID, 'requests', requestLog.$id, {
        tunnel_name: requestLog.tunnel_name,
        method: requestLog.method,
        path: requestLog.path,
        status: requestLog.status,
        duration_ms: requestLog.duration_ms,
        timestamp: requestLog.timestamp,
      }).catch((err) => console.error('[relay] failed to log request:', err));
    });

    ws.send(
      JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        path,
        headers: req.headers,
        body,
      })
    );
  });
});

app.post('/api/auth/cli/send-code', async (req, res) => {
  const email = req.body?.email;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email required' });
  }

  try {
    await auth.emailCode.sendCode({ email });
    res.json({ ok: true, delivery: emailDelivery });
  } catch (err) {
    console.error('[relay] cli send-code error:', err);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

app.post('/api/auth/cli/verify', async (req, res) => {
  const email = req.body?.email;
  const code = req.body?.code;
  if (!email || !code) {
    return res.status(400).json({ error: 'email and code required' });
  }

  try {
    const { user: radonUser } = await auth.emailCode.verify({ email, code });
    const appwriteUser = await findOrCreateUserFromRadon(radonUser);
    const { token } = auth.createSessionToken(radonUser.id);
    res.json({ token, username: appwriteUser.username });
  } catch (err) {
    console.error('[relay] cli verify error:', err);
    res.status(401).json({ error: 'Invalid or expired code' });
  }
});

app.get('/api/events', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  res.write(': connected\n\n');

  subscribeDashboard(user.$id, res);

  const ping = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(ping);
      return;
    }
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(ping);
    }
  }, 15_000);

  req.on('close', () => clearInterval(ping));
});

app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  res.json(userPublicProfile(user));
});

app.get('/api/requests/:name', async (req, res) => {
  const { name } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const tunnelMatch = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('name', name),
    Query.equal('user_id', user.$id),
  ]);
  if (tunnelMatch.total === 0) return res.status(403).json({ error: 'Not your tunnel' });

  const limit = historyLimit(user);
  const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0);
  const userIsPro = isPro(user);

  if (!userIsPro && offset > 0) {
    return res.status(403).json({
      error: 'Full request history requires Helix Pro.',
      upgradeUrl: UPGRADE_URL,
    });
  }

  const logs = await db.listDocuments(DB_ID, 'requests', [
    Query.equal('tunnel_name', name),
    Query.orderDesc('timestamp'),
    Query.limit(limit),
    ...(offset > 0 ? [Query.offset(offset)] : []),
  ]);

  res.json({
    requests: logs.documents,
    limit,
    offset,
    total: logs.total,
    isPro: userIsPro,
    capped: !userIsPro && logs.total > FREE_HISTORY_LIMIT,
  });
});

app.get('/api/tunnels', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const tunnelDocs = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('user_id', user.$id),
  ]);

  const userIsPro = isPro(user);
  const liveCount = tunnelDocs.documents.filter((t) => tunnels.has(t.name)).length;

  const results = await Promise.all(
    tunnelDocs.documents.map(async (t) => {
      const reqCount = await db.listDocuments(DB_ID, 'requests', [
        Query.equal('tunnel_name', t.name),
        Query.limit(1),
      ]);
      return {
        name: t.name,
        live: tunnels.has(t.name),
        requestCount: reqCount.total,
        passwordProtected: Boolean(t.password_hash),
      };
    })
  );

  res.json({
    tunnels: results,
    plan: userIsPro ? 'pro' : 'free',
    isPro: userIsPro,
    liveCount,
    tunnelLimit: userIsPro ? null : 1,
  });
});

app.patch('/api/tunnels/:name/password', async (req, res) => {
  const { name } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  if (!isPro(user)) {
    return res.status(403).json({ error: 'Password-protected tunnels require Helix Pro.' });
  }

  const tunnelMatch = await db.listDocuments(DB_ID, 'tunnels', [
    Query.equal('name', name),
    Query.equal('user_id', user.$id),
  ]);
  if (tunnelMatch.total === 0) return res.status(403).json({ error: 'Not your tunnel' });

  const tunnelDoc = tunnelMatch.documents[0];
  const { password } = req.body as { password?: string | null };

  if (password === null || password === '') {
    await db.updateDocument(DB_ID, 'tunnels', tunnelDoc.$id, { password_hash: null });
    const meta = tunnelMeta.get(name);
    if (meta) {
      meta.passwordHash = undefined;
      tunnelMeta.set(name, meta);
    }
    return res.json({ passwordProtected: false });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.updateDocument(DB_ID, 'tunnels', tunnelDoc.$id, { password_hash: passwordHash });

  const meta = tunnelMeta.get(name);
  if (meta) {
    meta.passwordHash = passwordHash;
    tunnelMeta.set(name, meta);
  }

  res.json({ passwordProtected: true });
});

app.post('/api/billing/initialize', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (!paymentsConfigured()) {
    return res.status(503).json({ error: 'Billing not configured' });
  }

  const dashboardUrl = DASHBOARD_URL.replace(/\/$/, '');
  const email = user.email || `${user.username}@users.helix.dev`;
  const name = user.name || user.username || 'Helix user';
  const productId = process.env.BACHS_PRODUCT_ID;

  try {
    const charge = await payments.charge({
      amount: proAmount(),
      customer: { email, name, id: user.$id },
      returnUrl: `${dashboardUrl}/dashboard/upgrade/callback`,
      reference: `helix-pro-${user.$id}-${Date.now()}`,
      metadata: { user_id: user.$id, plan: 'pro' },
      providerOptions: {
        cancelUrl: `${dashboardUrl}/dashboard/upgrade`,
        ...(productId ? { product_cart: [{ product_id: productId, quantity: 1 }] } : {}),
      },
    });

    const raw = charge.raw as Record<string, unknown> | undefined;
    const checkoutId = charge.id || checkoutIdFromRaw(raw);
    const checkoutUrl =
      charge.redirectUrl ||
      (typeof raw?.checkout_url === 'string' ? raw.checkout_url : undefined);

    if (!checkoutUrl) {
      console.error('[relay] Bachs checkout missing redirect URL:', charge.raw);
      return res.status(502).json({ error: 'Payment initialization failed' });
    }

    res.json({
      checkout_url: checkoutUrl,
      authorization_url: checkoutUrl,
      checkout_id: checkoutId,
      reference: charge.id,
    });
  } catch (err) {
    console.error('[relay] Radon Payments charge failed:', err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : 'Payment initialization failed',
    });
  }
});

app.get('/api/billing/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const checkoutId = (req.query.checkout_id || req.query.reference) as string;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  if (!checkoutId) return res.status(400).json({ error: 'Missing checkout_id' });

  const user = await resolveUserFromAuth(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (!paymentsConfigured()) {
    return res.status(503).json({ error: 'Billing not configured' });
  }

  try {
    const charge = await payments.retrieveCharge(checkoutId, { provider: 'bachs' });

    if (charge.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not verified',
        details: charge.status,
      });
    }

    const metaUserId = metadataUserId(charge.raw) ?? metadataUserId(charge.metadata);
    if (metaUserId && metaUserId !== user.$id) {
      return res.status(403).json({ error: 'Payment does not belong to this account' });
    }

    const raw = charge.raw as Record<string, unknown> | undefined;
    const customer = raw?.customer as { id?: string; customer_id?: string } | undefined;
    await activatePro(user.$id, customer?.id || customer?.customer_id);

    const updated = await db.getDocument(DB_ID, 'users', user.$id);
    res.json({ ok: true, ...userPublicProfile(updated as UserDoc) });
  } catch (err) {
    console.error('[relay] Radon Payments verify failed:', err);
    return res.status(400).json({
      error: 'Payment not verified',
      details: err instanceof Error ? err.message : undefined,
    });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const wsProxyServer = new WSServer({ noServer: true });
const browserSockets = new Map<string, WebSocket>();

server.on('upgrade', async (req, socket, head) => {
  const url = new URL(req.url ?? '', RELAY_URL);
  if (url.pathname === '/register') return;

  const match = url.pathname.match(/^\/tunnel\/([^/]+)(\/.*)?$/);
  if (!match) return socket.destroy();

  const [, name, rest] = match;
  const clientWs = tunnels.get(name);
  if (!clientWs) return socket.destroy();

  const meta = tunnelMeta.get(name);
  if (meta?.passwordHash) {
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Basic ')) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm="Helix Tunnel"\r\n\r\n');
      socket.destroy();
      return;
    }
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');
    const password = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
    const ok = await bcrypt.compare(password, meta.passwordHash);
    if (!ok) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm="Helix Tunnel"\r\n\r\n');
      socket.destroy();
      return;
    }
  }

  wsProxyServer.handleUpgrade(req, socket, head, (browserWs) => {
    const connectionId = crypto.randomUUID();
    browserSockets.set(connectionId, browserWs);

    clientWs.send(
      JSON.stringify({
        type: 'ws-open',
        connectionId,
        path: rest || '/',
      })
    );

    browserWs.on('message', (data, isBinary) => {
      clientWs.send(
        JSON.stringify({
          type: 'ws-message',
          connectionId,
          data: Buffer.from(data as Buffer).toString('base64'),
          isBinary,
        })
      );
    });

    browserWs.on('close', () => {
      browserSockets.delete(connectionId);
      clientWs.send(JSON.stringify({ type: 'ws-close', connectionId }));
    });
  });
});

server.listen(PORT, async () => {
  try {
    await auth.init();
    console.log('[relay] Radon auth ready');
  } catch (err) {
    console.error('[relay] Radon init failed:', err);
  }
  console.log(`[relay] listening on ${PORT}`);
});
