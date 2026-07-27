const strip = (url: string) => url.replace(/\/$/, '');

export const RELAY_URL = strip(process.env.RELAY_URL || 'https://helix-t47s.onrender.com');
export const DASHBOARD_URL = strip(process.env.DASHBOARD_URL || 'https://helix01.vercel.app');
export const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL || `${RELAY_URL}/auth/github/callback`;
export const UPGRADE_URL = `${DASHBOARD_URL}/dashboard/upgrade`;
export const CLI_CALLBACK_PORT = 51234;

export function upgradeHint(): string {
  return `Upgrade at ${DASHBOARD_URL.replace(/^https?:\/\//, '')}/dashboard/upgrade to run more.`;
}

export function freeTierTip(): string {
  return `Tip: ${DASHBOARD_URL.replace(/^https?:\/\//, '')}/dashboard/upgrade for more tunnels & full history`;
}
