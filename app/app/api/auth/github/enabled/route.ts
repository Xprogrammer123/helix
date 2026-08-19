import { isGithubAuthConfigured } from "@/lib/github-auth";

export async function GET() {
  return Response.json({ enabled: isGithubAuthConfigured() });
}
