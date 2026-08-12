import { Radon } from "@radonsdk/auth";
import { postgresAdapter } from "@radonsdk/auth/adapters/postgres";
import { resendSender } from "@radonsdk/auth/senders/resend";
import { Pool } from "pg";
import { APP_URL } from "./urls";

let pool: Pool | null = null;
let authInstance: Radon | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Radon auth");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export function getAuth(): Radon {
  if (!authInstance) {
    const secret = process.env.RADON_SECRET;
    if (!secret) {
      throw new Error(
        "RADON_SECRET is required. Set it from an environment variable."
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      throw new Error("RESEND_API_KEY is required for email sign-in");
    }

    const sender = resendSender({
      apiKey: resendKey,
      from: process.env.RADON_EMAIL_FROM || "Helix <auth@helix.dev>",
    });

    const googleClientId = process.env.RADON_GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.RADON_GOOGLE_CLIENT_SECRET;

    authInstance = new Radon({
      adapter: postgresAdapter(getPool()),
      session: { secret },
      appName: "Helix",
      rateLimit: { maxPerWindow: 10, windowMs: 600_000 },
      providers: {
        emailCode: { sender },
        ...(googleClientId && googleClientSecret
          ? {
              google: {
                clientId: googleClientId,
                clientSecret: googleClientSecret,
                redirectUri: `${APP_URL.replace(/\/$/, "")}/api/auth/google/callback`,
              },
            }
          : {}),
      },
    });
  }

  return authInstance;
}
