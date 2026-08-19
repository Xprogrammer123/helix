import { RadonPayments, money } from '@radonsdk/payments';
import type { IncomingHttpHeaders } from 'http';

const secretKey =
  process.env.RADON_BACHS_SECRET_KEY || process.env.BACHS_API_KEY || '';
const webhookSecret =
  process.env.RADON_BACHS_WEBHOOK_SECRET || process.env.BACHS_WEBHOOK_SECRET;

export const PRO_PRICE_MINOR = 250_000;
export const PRO_CURRENCY = 'NGN';

export function paymentsConfigured(): boolean {
  return Boolean(secretKey);
}

export const payments = new RadonPayments({
  mode: secretKey.startsWith('sk_live_') ? 'live' : 'test',
  defaultProvider: 'bachs',
  providers: {
    bachs: {
      secretKey: secretKey || undefined,
      webhookSecret: webhookSecret || undefined,
    },
  },
});

export function proAmount() {
  return money(PRO_PRICE_MINOR, PRO_CURRENCY);
}

export function webhookHeaders(headers: IncomingHttpHeaders) {
  return headers as Record<string, string | string[] | undefined>;
}

export function metadataUserId(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  const direct = record.metadata as Record<string, unknown> | undefined;
  if (typeof direct?.user_id === 'string') return direct.user_id;

  const nested = record.data as Record<string, unknown> | undefined;
  const nestedMeta = nested?.metadata as Record<string, unknown> | undefined;
  if (typeof nestedMeta?.user_id === 'string') return nestedMeta.user_id;

  return undefined;
}

export function checkoutIdFromRaw(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const record = source as Record<string, unknown>;
  const id = record.checkout_id ?? record.id;
  return typeof id === 'string' ? id : undefined;
}
