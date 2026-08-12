import { Radon } from '@radonsdk/auth';
import { postgresAdapter } from '@radonsdk/auth/adapters/postgres';
import { resendSender } from '@radonsdk/auth/senders/resend';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sender = resendSender({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.RADON_EMAIL_FROM || 'Helix <auth@helix.dev>',
});

export const auth = new Radon({
  adapter: postgresAdapter(pool),
  session: { secret: process.env.RADON_SECRET! },
  appName: 'Helix',
  providers: {
    emailCode: { sender },
  },
});
