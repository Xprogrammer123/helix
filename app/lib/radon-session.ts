import type { Radon } from "@radonsdk/auth";

const SESSION_COOKIE = "radon_session";

export function createSessionCookie(auth: Radon, userId: string) {
  const { token, expiresAt } = auth.createSessionToken(userId);
  const maxAge = Math.max(
    0,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000)
  );

  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge,
    },
  };
}

export function sessionResponse(
  auth: Radon,
  userId: string,
  redirectTo: string
) {
  const cookie = createSessionCookie(auth, userId);
  const response = Response.redirect(redirectTo, 302);
  response.headers.append(
    "Set-Cookie",
    `${cookie.name}=${encodeURIComponent(cookie.value)}; Path=${cookie.options.path}; Max-Age=${cookie.options.maxAge}; HttpOnly; SameSite=Lax${cookie.options.secure ? "; Secure" : ""}`
  );
  return response;
}
