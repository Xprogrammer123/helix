export const RELAY_URL =
  process.env.NEXT_PUBLIC_RELAY_URL ?? "https://helix-t47s.onrender.com";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://helix01.vercel.app";

export function getRelayUrl() {
  return process.env.RELAY_URL ?? RELAY_URL;
}

export function getPublicRelayUrl() {
  return process.env.NEXT_PUBLIC_RELAY_URL ?? getRelayUrl();
}
