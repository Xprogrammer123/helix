# Helix

Expose your localhost to the internet. No 2-hour timeouts, no vendor lock-in, no BS.

Helix is a lightweight, open-source tunneling tool — an ngrok alternative built for developers who need to share a local dev server, test webhooks, or demo work-in-progress without spinning up real infrastructure.

```bash
helix login
helix myapp 3000
# → https://helix.onrender.com/tunnel/myapp/
```

## Why

Free tiers on existing tunnel tools expire your URL every couple hours, forcing you to re-paste links mid-demo or mid-webhook-test. Helix keeps your tunnel alive as long as your client is connected — persistent names, tied to your account, no clock running out on you.

## Features

- 🔗 **Persistent public URLs** — claim a name, keep it across restarts
- 🔐 **Email sign-in (Radon)** — passwordless codes, self-hosted, no vendor lock-in
- 🩺 **Auto-reconnect + heartbeat** — dead tunnels get swept automatically
- 🧵 **HTML path rewriting** — relative asset links resolve correctly through the tunnel
- 🆓 **Free to self-host** — no paid infra required to run your own instance

## How it works

```
┌──────────────┐        WebSocket         ┌──────────────┐        HTTP        ┌──────────────┐
│  Helix CLI   │ ◄──────────────────────► │ Relay Server │ ◄─────────────────  │   Internet   │
│ (your laptop)│      persistent conn     │  (always on) │     public URL      │  (anyone)    │
└──────┬───────┘                          └──────────────┘                    └──────────────┘
       │
       ▼
┌──────────────┐
│  localhost:  │
│    3000      │
└──────────────┘
```

1. The CLI opens a persistent WebSocket connection from your machine to the relay server.
2. The relay hands you a public URL tied to your claimed tunnel name.
3. Requests to that URL are forwarded down the socket to your CLI, which proxies them to your local server and sends the response back up.

## Getting started

### Install

```bash
npm install -g helix-tunnel
```

### Login

```bash
helix login
```

Enter your email and the 6-digit verification code. Your session is saved locally — you won't need to log in again.

### Start a tunnel

```bash
helix <name> <port>
```

```bash
helix myapp 3000
```

Your local server on port 3000 is now live at `https://helix.onrender.com/tunnel/myapp/`.

## Self-hosting

Helix is fully open-source and self-hostable.

```bash
git clone https://github.com/thatcreativetayo/helix.git
cd helix

# relay server
cd relay
pnpm install
cp .env.example .env   # Radon + Appwrite credentials
pnpm init-db
pnpm dev

# web dashboard
cd ../app
pnpm install
cp .env.example .env
pnpm init-db
pnpm dev

# cli client
cd ../client
pnpm install
pnpm build
node dist/index.js login
```

### Environment variables

| Variable | Description |
|---|---|
| `RADON_SECRET` | JWT signing secret (`openssl rand -hex 32`) |
| `DATABASE_URL` | Postgres URL for Radon auth tables |
| `RESEND_API_KEY` | Resend API key for email verification codes |
| `RADON_EMAIL_FROM` | From address for auth emails |
| `APPWRITE_ENDPOINT` | Your Appwrite instance URL |
| `APPWRITE_PROJECT_ID` | Appwrite project ID |
| `APPWRITE_API_KEY` | Appwrite API key |
| `APPWRITE_DB_ID` | Appwrite database ID |

Auth is powered by [Radon](https://radonsdk.xyz/docs) — see their docs for optional Google OAuth and other providers.

## Tech stack

- **Relay server** — Node.js, TypeScript, Express, `ws`
- **CLI client** — Node.js, TypeScript
- **Database** — Appwrite (tunnels, billing) + Postgres (Radon auth)
- **Auth** — [Radon](https://radonsdk.xyz/docs) (email codes)
- **Hosting** — Render (free tier)
- **Package manager** — pnpm

## Roadmap

- [ ] Request inspector dashboard (live traffic log + replay)
- [ ] Custom domains
- [ ] Team/org support
- [ ] TCP/UDP tunnels, not just HTTP

## License

MIT

## Contributing

Issues and PRs welcome. This is a small, actively-developed project — if something's broken or missing, open an issue.
