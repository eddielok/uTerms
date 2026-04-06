# uTerms

A consent management and compliance platform. Scan websites for cookies, configure a cookie consent banner, embed it on any site, and log visitor consent decisions — all from one dashboard.

## Features

- **Cookie Scanner** — Puppeteer-powered scan that detects and categorises cookies (Essential, Functional, Analytics, Marketing, Social)
- **Consent Banner** — Configurable banner (theme, position, style) embeddable on any website via a single script tag
- **Policy Generator** — AI-assisted generation for 10 policy types: Privacy Policy, Cookie Policy, Terms of Service, EULA, Return Policy, Disclaimer, Shipping Policy, Acceptable Use Policy, Impressum, Accessibility Statement
- **Consent Logs** — Per-visitor consent decisions stored with anonymised IP, user agent, and page URL
- **GCM v2** — Google Consent Mode v2 compliance scanning
- **Account Settings** — Change email/password, export data (GDPR Art. 20), delete account (GDPR Art. 17)
- **CCPA** — "Do Not Sell or Share My Personal Information" page at `/do-not-sell`

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7 |
| Backend | Node.js, Express 5 |
| Database & Auth | Supabase (PostgreSQL) |
| Hosting | Cloudflare Workers (frontend), VM (backend) |
| Error Monitoring | Sentry |
| Headless Browser | Puppeteer |

## Project Structure

```
uTerms/
├── src/                      # React frontend
│   ├── components/           # Shared UI components (Layout, Sidebar, Button, etc.)
│   ├── context/              # CookieContext — global state + Supabase sync
│   ├── hooks/                # useManagementPolicy, usePreviewPolicy
│   ├── lib/                  # supabase.ts, config.ts
│   ├── pages/                # Route-level page components
│   └── utils/                # Policy generators, htmlToText
├── server/                   # Express backend
│   ├── index.js              # API server (port 3001)
│   ├── utils.js              # Cookie categorisation helpers
│   ├── utils.test.js         # Node built-in test runner tests
│   └── migrations/           # SQL migration files
├── public/                   # Static assets + embed scripts
│   ├── uterms-embed.js       # Embeddable consent banner script
│   ├── sitemap.xml
│   └── robots.txt
└── vite.config.ts            # Vite config + resourceBlockerPlugin
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
VITE_SENTRY_DSN=https://...@....ingest.sentry.io/...
SENTRY_DSN=https://...@....ingest.sentry.io/...
VITE_API_URL=http://localhost:3001
IP_SALT=<random-string>
```

> `SUPABASE_SERVICE_ROLE_KEY` is required for account deletion and scheduled scans. Never expose it to the frontend.

### Run Locally

**Frontend** (http://localhost:5173):
```bash
npm install
npm run dev
```

**Backend** (http://localhost:3001):
```bash
cd server
npm install
node index.js
```

## Commands

### Frontend

```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Build and preview via Wrangler
npm run deploy     # Build and deploy to Cloudflare Workers
npm run test       # Run Vitest tests
```

### Backend

```bash
node index.js                      # Start API server
node --test server/utils.test.js   # Run server unit tests
node server/test-scan.js           # Manual cookie scan test
```

## Backend API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/scan` | — | Puppeteer cookie scan for a URL |
| `GET` | `/api/banner/:userId` | — | Banner config for embed script |
| `POST` | `/api/consent` | — | Log a visitor consent decision |
| `GET` | `/api/consent/:userId` | API key | Fetch consent logs |
| `DELETE` | `/api/consent/:userId` | API key | Delete consent logs |
| `POST` | `/api/gcm-scan` | API key | GCM v2 compliance scan |
| `POST` | `/api/analyze-policy` | API key | AI policy analysis |
| `GET` | `/api/scan-schedule/:userId` | API key | Get scan schedule |
| `POST` | `/api/scan-schedule` | API key | Create/update scan schedule |
| `DELETE` | `/api/scan-schedule/:userId` | API key | Delete scan schedule |
| `POST` | `/api/delete-account` | Bearer JWT | Permanently delete user account |

API key authentication uses `X-API-Key: utk_<32 hex chars>` header, verified against the `api_keys` Supabase table.

## Database Schema

Key Supabase tables:

**`user_cookie_settings`** — scanned cookie data and banner config per user  
**`visitor_consent`** — individual visitor consent decisions  
**`api_keys`** — user API keys for programmatic access  
**`scan_schedules`** — scheduled cookie scan configuration  

Policy tables (one per type): `privacy_policies`, `cookie_policies`, `terms_of_service`, `eula`, `return_policy`, `disclaimer`, `shipping_policy`, `acceptable_use_policy`, `impressum`, `accessibility_statement`

Each policy table has: `id uuid`, `user_id uuid`, `title text`, `status text`, `generated text`, `updated_at timestamptz`

## Embedding the Banner

Add to any website's `<head>`:

```html
<script src="https://uterms.io/uterms-embed.js?userId=YOUR_USER_ID" async></script>
```

Or use the resource blocker (blocks third-party scripts until consent):

```html
<script src="https://uterms.io/resource-blocker/YOUR_USER_ID" async></script>
```

## Compliance

- **GDPR Art. 17** — Account deletion via Settings → deletes all user data via Supabase cascade
- **GDPR Art. 20** — Data export via Settings → downloads all policies and consent logs as JSON
- **CCPA** — "Do Not Sell" page at `/do-not-sell`
- **Visitor IPs** — Anonymised before storage (`x.x` suffix for IPv4, SHA-256 hash for IPv6)
