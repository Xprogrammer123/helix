import WebSocket from 'ws';
import http from 'http';
import zlib from 'zlib';
import { login, loadConfig } from './auth.js';

type RelayMessage = {
  type: 'request' | 'response' | 'connected';
  requestId?: string;
  method?: string;
  path?: string;
  headers?: http.IncomingHttpHeaders;
  body?: string;
  status?: number;
  plan?: string;
  tip?: string | null;
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

async function main() {
  if (process.argv[2] === 'login') {
    const { username } = await login();
    console.log(`Logged in as ${username}`);
    process.exit(0);
  }

  const session = loadConfig();
  if (!session) {
    console.log('Not logged in. Run: helix login');
    process.exit(1);
  }
  console.log(`[client] using saved session for ${session.username}`);

  const RELAY_HTTP = (process.env.RELAY_URL || 'ws://localhost:4000/register')
    .replace(/^ws/, 'http')
    .replace(/\/register$/, '');
  const RELAY_WS = process.env.RELAY_URL || 'ws://localhost:4000/register';
  const { name, localPort, password } = parseArgs(process.argv.slice(2));

  const params = new URLSearchParams({ name, token: session.token });
  if (password) params.set('password', password);

  const ws = new WebSocket(`${RELAY_WS}?${params.toString()}`);

  ws.on('open', () => {
    console.log(`[client] up. Public: ${RELAY_HTTP}/tunnel/${name}/`);
    setInterval(() => {
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

    if (msg.type !== 'request' || !msg.requestId) return;

    const proxyReq = http.request(
      {
        hostname: 'localhost',
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
  });

  ws.on('close', (code, reason) => {
    const msg = reason.toString();
    if (code === 4004 || msg.includes('Free plan allows')) {
      console.error(`\n${msg || 'Free plan allows 1 active tunnel. Upgrade at helix.dev/dashboard/upgrade to run more.'}`);
      process.exit(1);
    }
    if (code === 4005 || msg.includes('Password-protected')) {
      console.error(`\n${msg || 'Password-protected tunnels require Helix Pro.'}`);
      process.exit(1);
    }
    console.log('[client] disconnected');
  });
}

main();
