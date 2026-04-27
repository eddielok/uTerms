# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**uTerms** is a consent management and compliance platform. It lets users scan websites for cookies, configure a cookie consent banner, embed that banner on external sites, log visitor consent decisions, and monitor for real-time PII data leakage.

## Commands

### Frontend (React/Vite)

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (Express/Puppeteer)

```bash
cd server
node index.js      # Runs on port 3001
```

There is no automated test suite. Manual testing uses `server/test-scan.js`, `public/test-embed.html`, and `public/test-pii-monitor.html`.

## Architecture

### Two separate runtimes

- **Frontend** (`src/`, `vite.config.ts`): React 19 + TypeScript SPA served by Vite.
- **Backend** (`server/index.js`): Node.js/Express server on port 3001, must be run separately.

### Frontend structure

- **Routing** (`src/App.tsx`): React Router v7. Public pages (Home, Login, Register, Policies, About, Features) and protected pages under a sidebar layout (Dashboard, Consent Management, Policy Management, Settings, Cookie Logs, PII Alerts).
- **State** (`src/context/CookieContext.tsx`): Single React Context manages `scannedData` (cookie scan results), `bannerConfig` (theme/position/style), `isPreviewVisible`, and `userId`. Auto-syncs to Supabase with a 1-second debounce.
- **Auth** (`src/lib/supabase.ts`): Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Supports email and Google OAuth.

### Backend API (`server/index.js`)

| Endpoint | Description |
|---|---|
| `POST /api/scan` | Launches Puppeteer, visits the target URL, intercepts all cookies via CDP, categorizes them (Essential / Functional / Analytics / Marketing / Social / Unclassified), returns grouped results. Also detects PII leakage in outgoing requests during the scan. |
| `GET /api/banner/:userId` | Returns the user's banner config and scanned data from Supabase (used by the embed script). Includes `detected_lang` based on visitor IP via geoip-lite. |
| `POST /api/consent` | Logs visitor consent decisions to the `visitor_consent` table. |
| `GET /api/consent/:userId` | Returns paginated consent logs (requires API key). |
| `DELETE /api/consent/:userId` | Deletes all consent records for a user (requires API key). |
| `POST /api/gcm-scan` | Checks Google Consent Mode v2 compliance for a URL. |
| `POST /api/classify-cookies` | AI-powered cookie classification using DeepSeek V3. |
| `POST /api/analyze-policy` | AI pre-fill for a single policy type using DeepSeek V3. |
| `POST /api/analyze-all-policies` | AI pre-fill for all 10 policy types in one call. |
| `GET /api/policy-scan/:userId` | Retrieve saved policy scan results. |
| `POST /api/pii-report` | Ingests PII leak reports from the monitor script; saves to `pii_alerts` table. |
| `GET /api/scan-schedule/:userId` | Get scheduled cookie scan config (requires API key). |
| `POST /api/scan-schedule` | Create/update scan schedule (requires API key). |
| `DELETE /api/scan-schedule/:userId` | Delete scan schedule (requires API key). |
| `POST /api/delete-account` | Permanently deletes user account and all data (requires Bearer JWT). |

### Embeddable banner (`public/uterms-embed.js`)

Standalone script dropped on any website. Fetches config from `/api/banner/:userId`, renders the consent banner in 9 languages (auto-detected by IP region), stores consent in `localStorage`, and posts decisions back to `POST /api/consent`. The user ID is read from the script's `src` URL parameter.

### PII monitor (`public/uterms-pii-monitor.js`)

Standalone script dropped on any website. Intercepts `fetch`, `XMLHttpRequest`, and form submissions. Detects email, phone, SSN, and credit card (Luhn-validated) patterns. Deduplicates by domain+type per session. Batches reports with a 5-second debounce via `navigator.sendBeacon` to `POST /api/pii-report`. Supports `&test=1` param to suppress reporting (logs to console only). Test page at `public/test-pii-monitor.html` (add `&live=1` to send real reports).

### Vite plugin (`vite.config.ts` — `resourceBlockerPlugin`)

Serves a dynamically generated JavaScript file at `/resource-blocker/:userId`. This endpoint fetches the user's banner config from Supabase at request time and returns a fully configured inline script.

### Database (Supabase/PostgreSQL)

Key tables:

- `user_cookie_settings` — scanned cookie data and banner config per user
- `visitor_consent` — individual visitor consent decisions (visitor UUID, consent data, URL, IP, user agent)
- `pii_alerts` — PII leak events from the monitor script (domain, pii_types text[], third_party, method, page_url, url, created_at)
- `api_keys` — user API keys (`utk_` prefix, 32 hex chars)
- `scan_schedules` — scheduled cookie scan configuration
- `gcm_scan_results` — GCM v2 compliance scan results per user

`user_cookie_settings` schema:
| Column | Type | Description |
|---|---|---|
| `user_id` | uuid | Primary key, FK → `auth.users(id)`, cascade delete |
| `scanned_data` | jsonb | Latest cookie scan results |
| `banner_config` | jsonb | Banner theme/position/style config (includes PIPL fields) |
| `created_at` | timestamptz | Row creation time, defaults to now() |
| `updated_at` | timestamptz | Last update time, defaults to now() |

`visitor_consent` schema:
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | uuid | Banner owner's user ID (not FK-constrained) |
| `visitor_id` | uuid | Anonymous visitor UUID, defaults to `gen_random_uuid()` |
| `consent_data` | jsonb | Consent decisions per category (required) |
| `url` | text | Page URL where consent was given |
| `ip_address` | text | Visitor IP address |
| `user_agent` | text | Visitor browser user agent |
| `created_at` | timestamptz | Consent timestamp (UTC) |

`pii_alerts` schema:
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | uuid | Site owner's user ID |
| `domain` | text | Hostname that received PII |
| `pii_types` | text[] | Detected types: email, phone, ssn, credit_card |
| `third_party` | boolean | True if domain differs from page hostname |
| `method` | text | HTTP method |
| `page_url` | text | Page where the leak occurred |
| `url` | text | First 200 chars of request URL containing PII |
| `created_at` | timestamptz | Detection timestamp (UTC) |

### Environment variables

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_API_URL=...
IP_SALT=...
DEEPSEEK_API_KEY=...
```

Set in `.env` at the project root. The backend (`server/index.js`) also connects to Supabase directly via its own REST calls using these same values (or equivalent server-side env vars).
