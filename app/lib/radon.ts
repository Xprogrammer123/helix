import { Radon } from "@radonsdk/auth";
import { postgresAdapter } from "@radonsdk/auth/adapters/postgres";
import { resendSender } from "@radonsdk/auth/senders/resend";
import { Pool } from "pg";
import { APP_URL } from "./urls";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sender = resendSender({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.RADON_EMAIL_FROM || "Helix <auth@helix.dev>",
});

const googleClientId = process.env.RADON_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.RADON_GOOGLE_CLIENT_SECRET;

export const auth = new Radon({
  adapter: postgresAdapter(pool),
  session: { secret: process.env.RADON_SECRET! },
  appName: "Helix",
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
