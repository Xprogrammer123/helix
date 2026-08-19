import {
  createOAuthProvider,
  getPreset,
  type OAuthProvider,
} from "@radonsdk/auth/pro/oauth";
import type { NormalizedProfile, TokenResponse } from "@radonsdk/auth/pro/oauth";
import { getAppUrl } from "./urls";
import { ensureAuthReady } from "./radon";

let githubProvider: OAuthProvider | null | undefined;

type GithubEmail = {
  email?: string;
  primary?: boolean;
  verified?: boolean;
};

async function fetchGithubProfile(
  tokens: TokenResponse,
  ctx: {
    fetch: typeof fetch;
  }
): Promise<NormalizedProfile> {
  const accessToken = tokens.access_token;
  if (!accessToken) {
    throw new Error("GitHub token response had no access_token.");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
  };

  const userRes = await ctx.fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) {
    throw new Error(`GitHub userinfo failed (${userRes.status}).`);
  }

  const user = (await userRes.json()) as Record<string, unknown>;
  const emailsRes = await ctx.fetch("https://api.github.com/user/emails", {
    headers,
  });

  let email =
    typeof user.email === "string" ? user.email.toLowerCase() : null;
  let emailVerified = false;

  if (emailsRes.ok) {
    const emails = (await emailsRes.json()) as GithubEmail[];
    const verified =
      emails.find((entry) => entry.primary && entry.verified) ??
      emails.find((entry) => entry.verified);
    if (verified?.email) {
      email = verified.email.toLowerCase();
      emailVerified = true;
    }
  }

  return {
    id: String(user.id ?? ""),
    email,
    emailVerified,
    name: typeof user.name === "string" ? user.name : undefined,
    username: typeof user.login === "string" ? user.login : undefined,
    avatarUrl:
      typeof user.avatar_url === "string" ? user.avatar_url : undefined,
    raw: user,
  };
}

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
  const preset = getPreset("github");

  githubProvider = createOAuthProvider(
    {
      ...preset,
      fetchProfile: fetchGithubProfile,
    },
    {
      engine: auth.engine,
      clientId,
      clientSecret,
      redirectUri: `${getAppUrl()}/api/auth/github/callback`,
    }
  );

  return githubProvider;
}
