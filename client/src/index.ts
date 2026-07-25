import WebSocket from 'ws';
import http from 'http';
import zlib from 'zlib';
import { login, loadConfig } from './auth.js';

type RelayMessage = {
  type: 'request' | 'response';
  requestId: string;
  method?: string;
  path?: string;
  headers?: http.IncomingHttpHeaders;
  body?: string; // base64-encoded
  status?: number;
};

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

  const RELAY_URL = process.env.RELAY_URL || 'ws://localhost:4000/register';
  const name = process.argv[2] || 'test';
  const localPort = process.argv[3] || '3000';

  const ws = new WebSocket(`${RELAY_URL}?name=${name}&token=${session.token}`);

  ws.on('open', () => {
    console.log(`[client] up. Public: http://localhost:4000/tunnel/${name}/`);
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  });

  ws.on('message', (data) => {
    const msg: RelayMessage = JSON.parse(data.toString());
    if (msg.type !== 'request') return;

    const proxyReq = http.request(
      { hostname: 'localhost', port: localPort, path: msg.path, method: msg.method, headers: msg.headers as any },
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

          ws.send(JSON.stringify({
            type: 'response',
            requestId: msg.requestId,
            status: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: buffer.toString('base64'),
          }));
        });
      }
    );

    proxyReq.on('error', () => {
      ws.send(JSON.stringify({
        type: 'response',
        requestId: msg.requestId,
        status: 502,
        body: Buffer.from('Local server unreachable').toString('base64'),
      }));
    });

    if (msg.body) proxyReq.write(msg.body);
    proxyReq.end();
  });

  ws.on('close', () => console.log('[client] disconnected'));
}

main();