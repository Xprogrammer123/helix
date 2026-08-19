import { getGithubProvider } from "@/lib/github-auth";
import { ensureAuthReady } from "@/lib/radon";
import { sessionResponse } from "@/lib/radon-session";

export async function GET(request: Request) {
  const github = await getGithubProvider();
  if (!github) {
    return Response.redirect(
      new URL("/auth?error=auth_failed", request.url),
      302
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return Response.redirect(
      new URL("/auth?error=auth_failed", request.url),
      302
    );
  }

  try {
    const auth = await ensureAuthReady();
    const { user } = await github.handleCallback({ code });
    return sessionResponse(auth, user.id, new URL("/dashboard", request.url).toString());
  } catch {
    return Response.redirect(
      new URL("/auth?error=auth_failed", request.url),
      302
    );
  }
}
