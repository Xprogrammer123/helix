const strip = (url: string) => url.replace(/\/$/, '');

export const RELAY_URL = strip(process.env.RELAY_URL || 'https://helix-um9b.onrender.com');
export const DASHBOARD_URL = strip(process.env.DASHBOARD_URL || 'https://helix.pxxl.click');
export const UPGRADE_URL = `${DASHBOARD_URL}/dashboard/upgrade`;

export function upgradeHint(): string {
  return `Upgrade at ${DASHBOARD_URL.replace(/^https?:\/\//, '')}/dashboard/upgrade to run more.`;
}

export function freeTierTip(): string {
  return `Tip: ${DASHBOARD_URL.replace(/^https?:\/\//, '')}/dashboard/upgrade for more tunnels & full history`;
}
