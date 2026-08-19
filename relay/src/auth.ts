import 'dotenv/config';
import { Radon, type EmailSender } from '@radonsdk/auth';
import { postgresAdapter } from '@radonsdk/auth/adapters/postgres';
import { resendSender } from '@radonsdk/auth/senders/resend';
import { Pool } from 'pg';

if (!process.env.RADON_SECRET) {
  throw new Error('RADON_SECRET is required. Add it to relay/.env');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Add a Postgres URL to relay/.env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const consoleSender: EmailSender = {
  async send({ to, subject, text, html }) {
    const body = text || html || '';
    const code = body.match(/\b(\d{6})\b/)?.[1];
    console.log('\n========== Helix auth (dev) ==========');
    console.log(`To: ${to}`);
    if (subject) console.log(`Subject: ${subject}`);
    console.log(code ? `Code: ${code}` : body);
    console.log('======================================\n');
    return { provider: 'console' };
  },
};

export const emailDelivery: 'console' | 'resend' =
  process.env.RADON_EMAIL_MODE === 'resend'
    ? 'resend'
    : process.env.RADON_EMAIL_MODE === 'console' || process.env.NODE_ENV !== 'production'
      ? 'console'
      : 'resend';

const sender =
  emailDelivery === 'console'
    ? consoleSender
    : resendSender({
        apiKey: process.env.RESEND_API_KEY || '',
        from: process.env.RADON_EMAIL_FROM || 'Helix <auth@helix.dev>',
      });

// Used outside Radon auth flows (e.g. sending invoice notifications).
export const emailSender = sender;

export const auth = new Radon({
  adapter: postgresAdapter(pool),
  session: { secret: process.env.RADON_SECRET },
  appName: 'Helix',
  providers: {
    emailCode: { sender },
  },
});
