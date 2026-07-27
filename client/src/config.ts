const RELAY_BASE = (process.env.RELAY_URL || 'https://helix-t47s.onrender.com').replace(/\/$/, '');

export function getRelayHttpUrl(): string {
  return RELAY_BASE.replace(/^wss/i, 'https').replace(/^ws/i, 'http');
}

export function getRelayWsUrl(): string {
  const http = getRelayHttpUrl();
  const wsBase = http.replace(/^https/i, 'wss').replace(/^http/i, 'ws');
  return `${wsBase}/register`;
}

export const RELAY_HTTP = getRelayHttpUrl();
export const RELAY_WS = getRelayWsUrl();
export const GITHUB_CALLBACK_URL = `${RELAY_HTTP}/auth/github/callback`;
export const DASHBOARD_UPGRADE_URL =
  (process.env.DASHBOARD_URL || 'https://helix01.vercel.app').replace(/\/$/, '') +
  '/dashboard/upgrade';

export const CLI_CALLBACK_PORT = 51234;
