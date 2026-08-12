import { radonNextHandler } from "@radonsdk/auth/integrations/next";
import { auth } from "@/lib/radon";

const handler = radonNextHandler(auth, {
  basePath: "/api/auth",
  successRedirect: "/dashboard",
  failureRedirect: "/auth?error=auth_failed",
});

export const GET = handler;
export const POST = handler;
