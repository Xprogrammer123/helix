export const RELAY_URL =
  process.env.NEXT_PUBLIC_RELAY_URL ?? "https://helix-um9b.onrender.com";

export function getAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://helix01.vercel.app";
}

export const APP_URL = getAppUrl();

export function getRelayUrl() {
  return process.env.RELAY_URL ?? RELAY_URL;
}

export function getPublicRelayUrl() {
  return process.env.NEXT_PUBLIC_RELAY_URL ?? getRelayUrl();
}
