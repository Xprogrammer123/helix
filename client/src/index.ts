#!/usr/bin/env node
import WebSocket from 'ws';
import http from 'http';
import zlib from 'zlib';
import { login, loadConfig } from './auth.js';
import { RELAY_HTTP, RELAY_WS, DASHBOARD_UPGRADE_URL } from './config.js';

type RelayMessage = {
  type: 'request' | 'response' | 'connected' | 'ws-open' | 'ws-message' | 'ws-close';
  requestId?: string;
  method?: string;
  path?: string;
  headers?: http.IncomingHttpHeaders;
  body?: string;
  status?: number;
  plan?: string;
  tip?: string | null;
  connectionId?: string;
  data?: string;
  isBinary?: boolean;
};

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let password: string | undefined;

  for (const arg of argv) {
    if (arg.startsWith('--password=')) {
      password = arg.slice('--password='.length);
    } else {
      positional.push(arg);
    }
  }

  return {
    name: positional[0] || 'test',
    localPort: positional[1] || '3000',
    password,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function proxyHttpRequest(
  ws: WebSocket,
  msg: RelayMessage,
  localPort: string
) {
  if (!msg.requestId) return;

  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: localPort,
      path: msg.path,
      method: msg.method,
      headers: msg.headers as http.IncomingHttpHeaders,
    },
    (proxyRes) => {
      const chunks: Buffer[] = [];
      proxyRes.on('data', (c) => chunks.push(c));
      proxyRes.on('end', () => {
        let buffer = Buffer.concat(chunks);
        const encoding = proxyRes.headers['content-encoding'];

        try {
          if (encoding === 'gzip') buffer = zlib.gunzipSync(buffer);
          else if (encoding === 'br') buffer = zlib.brotliDecompressSync(buffer);
          else if (encoding === 'deflate') buffer = zlib.inflateSync(buffer);
        } catch (err) {
          console.error('[client] decompress failed:', err);
        }

        ws.send(
          JSON.stringify({
            type: 'response',
            requestId: msg.requestId,
            status: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: buffer.toString('base64'),
          })
        );
      });
    }
  );

  proxyReq.on('error', () => {
    ws.send(
      JSON.stringify({
        type: 'response',
        requestId: msg.requestId,
        status: 502,
        body: Buffer.from('Local server unreachable').toString('base64'),
      })
    );
  });

  if (msg.body) proxyReq.write(msg.body);
  proxyReq.end();
}

function connectTunnel(opts: {
  name: string;
  localPort: string;
  token: string;
  password?: string;
}): Promise<number> {
  const { name, localPort, token, password } = opts;
  const localSockets = new Map<string, WebSocket>();

  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ name, token });
    if (password) params.set('password', password);

    const ws = new WebSocket(`${RELAY_WS}?${params.toString()}`);
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let settled = false;

    const finish = (code: number) => {
      if (settled) return;
      settled = true;
      if (heartbeat) clearInterval(heartbeat);
      for (const local of localSockets.values()) local.close();
      localSockets.clear();
      resolve(code);
    };

    ws.on('open', () => {
      console.log(`[client] up. Public: ${RELAY_HTTP}/tunnel/${name}/`);
      heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString()) as RelayMessage;

      if (msg.type === 'connected') {
        if (msg.tip) console.log(`[client] ${msg.tip}`);
        return;
      }

      if (msg.type === 'request') {
        proxyHttpRequest(ws, msg, localPort);
        return;
      }

      if (msg.type === 'ws-open' && msg.connectionId) {
        const path = msg.path || '/';
        const local = new WebSocket(`ws://127.0.0.1:${localPort}${path}`);
        localSockets.set(msg.connectionId, local);

        local.on('message', (payload, isBinary) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          ws.send(
            JSON.stringify({
              type: 'ws-message',
              connectionId: msg.connectionId,
              data: Buffer.from(payload as Buffer).toString('base64'),
              isBinary,
            })
          );
        });

        local.on('close', () => {
          localSockets.delete(msg.connectionId!);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ws-close', connectionId: msg.connectionId }));
          }
        });

        local.on('error', () => {
          local.close();
        });
        return;
      }

      if (msg.type === 'ws-message' && msg.connectionId) {
        const local = localSockets.get(msg.connectionId);
        if (!local || local.readyState !== WebSocket.OPEN) return;
        local.send(Buffer.from(msg.data || '', 'base64'), { binary: Boolean(msg.isBinary) });
        return;
      }

      if (msg.type === 'ws-close' && msg.connectionId) {
        localSockets.get(msg.connectionId)?.close();
        localSockets.delete(msg.connectionId);
      }
    });

    ws.on('error', (err) => {
      if (settled) return;
      settled = true;
      if (heartbeat) clearInterval(heartbeat);
      for (const local of localSockets.values()) local.close();
      localSockets.clear();
      reject(err);
    });

    ws.on('close', (code, reason) => {
      const text = reason.toString();
      if (code === 4004 || text.includes('Free plan allows')) {
        console.error(
          `\n${text || `Free plan allows 1 active tunnel. Upgrade at ${DASHBOARD_UPGRADE_URL} to run more.`}`
        );
        process.exit(1);
      }
      if (code === 4005 || text.includes('Password-protected')) {
        console.error(`\n${text || 'Password-protected tunnels require Helix Pro.'}`);
        process.exit(1);
      }
      if (code === 4001 || code === 4002 || code === 4003) {
        console.error(`\n${text || 'Tunnel rejected. Run helix login and try again.'}`);
        process.exit(1);
      }
      console.log('[client] disconnected');
      finish(code);
    });
  });
}

async function main() {
  if (process.argv[2] === 'login') {
    try {
      const { username } = await login();
      console.log(`Logged in as ${username}`);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Login failed');
      process.exit(1);
    }
    process.exit(0);
  }

  const session = loadConfig();
  if (!session) {
    console.log('Not logged in. Run: helix login');
    process.exit(1);
  }
  console.log(`[client] using saved session for ${session.username}`);

  const { name, localPort, password } = parseArgs(process.argv.slice(2));

  let attempt = 0;
  for (;;) {
    try {
      await connectTunnel({
        name,
        localPort,
        token: session.token,
        password,
      });
      attempt = 0;
    } catch (err) {
      console.error('[client] connection error:', err instanceof Error ? err.message : err);
    }
    const delay = Math.min(1000 * 2 ** attempt, 15_000);
    attempt += 1;
    console.log(`[client] reconnecting in ${Math.round(delay / 1000)}s...`);
    await sleep(delay);
  }
}

main();
