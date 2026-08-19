import { Radon, type EmailSender } from "@radonsdk/auth";
import { postgresAdapter } from "@radonsdk/auth/adapters/postgres";
import { resendSender } from "@radonsdk/auth/senders/resend";
import { Pool } from "pg";
import { APP_URL } from "./urls";

let pool: Pool | null = null;
let authInstance: Radon | null = null;

const consoleSender: EmailSender = {
  async send({ to, subject, text, html }) {
    const body = text || html || "";
    const code = body.match(/\b(\d{6})\b/)?.[1];
    console.log("\n========== Helix auth (dev) ==========");
    console.log(`To: ${to}`);
    if (subject) console.log(`Subject: ${subject}`);
    console.log(code ? `Code: ${code}` : body);
    console.log("======================================\n");
    return { provider: "console" };
  },
};

export const emailDelivery: "console" | "resend" =
  process.env.RADON_EMAIL_MODE === "resend"
    ? "resend"
    : process.env.RADON_EMAIL_MODE === "console" ||
        process.env.NODE_ENV !== "production"
      ? "console"
      : "resend";

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

    const sender =
      emailDelivery === "console"
        ? consoleSender
        : resendSender({
            apiKey: process.env.RESEND_API_KEY || "",
            from: process.env.RADON_EMAIL_FROM || "Helix <auth@helix.dev>",
          });

    if (emailDelivery === "resend" && !process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required for email sign-in in production");
    }

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
