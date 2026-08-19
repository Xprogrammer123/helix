import { radonNextHandler } from "@radonsdk/auth/integrations/next";
import { ensureAuthReady, getAuth } from "@/lib/radon";

type RouteHandler = ReturnType<typeof radonNextHandler>;

let handler: RouteHandler | null = null;

function getHandler(): RouteHandler {
  if (!handler) {
    handler = radonNextHandler(getAuth(), {
      basePath: "/api/auth",
      successRedirect: "/dashboard",
      failureRedirect: "/auth?error=auth_failed",
    });
  }
  return handler;
}

export const GET = async (req: Request) => {
  await ensureAuthReady();
  return getHandler()(req);
};
export const POST = async (req: Request) => {
  await ensureAuthReady();
  return getHandler()(req);
};
