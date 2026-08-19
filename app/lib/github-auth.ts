import { createOAuthProvider } from "@radonsdk/auth/pro/oauth";
import type { OAuthProvider } from "@radonsdk/auth/pro/oauth";
import { getAppUrl } from "./urls";
import { ensureAuthReady } from "./radon";

let githubProvider: OAuthProvider | null | undefined;

function githubCredentials() {
  const clientId =
    process.env.RADON_GITHUB_CLIENT_ID ??
    process.env.GITHUB_CLIENT_ID ??
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret =
    process.env.RADON_GITHUB_CLIENT_SECRET ??
    process.env.GITHUB_CLIENT_SECRET ??
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET;

  return { clientId, clientSecret };
}

export function isGithubAuthConfigured() {
  const { clientId, clientSecret } = githubCredentials();
  return Boolean(clientId && clientSecret);
}

export async function getGithubProvider() {
  if (githubProvider !== undefined) return githubProvider;

  const { clientId, clientSecret } = githubCredentials();
  if (!clientId || !clientSecret) {
    githubProvider = null;
    return null;
  }

  const auth = await ensureAuthReady();
  githubProvider = createOAuthProvider("github", {
    engine: auth.engine,
    clientId,
    clientSecret,
    redirectUri: `${getAppUrl()}/api/auth/github/callback`,
  });

  return githubProvider;
}
