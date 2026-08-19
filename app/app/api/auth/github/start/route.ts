import { getGithubProvider } from "@/lib/github-auth";

export async function GET() {
  const github = await getGithubProvider();
  if (!github) {
    return Response.json({ error: "github_not_configured" }, { status: 503 });
  }

  const { url } = github.getAuthUrl();
  return Response.redirect(url, 302);
}
