export type UserDoc = {
  $id: string;
  username?: string;
  plan?: string;
  plan_expires_at?: string;
  paystack_customer_code?: string;
  paystack_subscription_code?: string;
  bachs_customer_id?: string;
  bachs_subscription_id?: string;
  token?: string;
  radon_user_id?: string;
  email?: string;
  github_id?: string;
  name?: string;
};

export const FREE_HISTORY_LIMIT = 50;
export const PRO_HISTORY_LIMIT = 500;
export const FREE_IDLE_TTL_MS = 120_000;
export const PRO_IDLE_TTL_MS = 24 * 60 * 60 * 1000;

export function isPro(user: UserDoc): boolean {
  if (user.plan !== 'pro') return false;
  if (!user.plan_expires_at) return true;
  return new Date(user.plan_expires_at) > new Date();
}

export function historyLimit(user: UserDoc): number {
  return isPro(user) ? PRO_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
}

export function idleTtlMs(user: UserDoc): number {
  return isPro(user) ? PRO_IDLE_TTL_MS : FREE_IDLE_TTL_MS;
}
