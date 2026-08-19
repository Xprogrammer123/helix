import crypto from 'crypto';

const SANDBOX = 'https://sandbox-api.bachs.io';
const LIVE = 'https://api.bachs.io';

export function bachsConfigured(): boolean {
  return Boolean(process.env.BACHS_API_KEY);
}

export function bachsBaseUrl(): string {
  const key = process.env.BACHS_API_KEY || '';
  if (process.env.BACHS_API_URL) return process.env.BACHS_API_URL.replace(/\/$/, '');
  return key.startsWith('sk_sandbox_') ? SANDBOX : LIVE;
}

export async function bachsFetch(path: string, init?: RequestInit) {
  const key = process.env.BACHS_API_KEY;
  if (!key) throw new Error('BACHS_API_KEY is not set');

  const res = await fetch(`${bachsBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function verifyBachsSignature(
  rawBody: Buffer | string,
  secret: string,
  timestampHeader: string | undefined,
  signatureHeader: string | undefined,
  toleranceSeconds = 300
): boolean {
  if (!timestampHeader || !signatureHeader) return false;
  const timestamp = parseInt(timestampHeader, 10);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export function metadataUserId(data: Record<string, unknown> | undefined): string | undefined {
  const meta = data?.metadata as Record<string, unknown> | undefined;
  const id = meta?.user_id;
  return typeof id === 'string' ? id : undefined;
}
