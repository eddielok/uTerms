# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**uTerms** is a consent management and compliance platform. It lets users scan websites for cookies, configure a cookie consent banner, and embed that banner on external sites. Visitor consent decisions are logged back to the platform.

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

There is no automated test suite. Manual testing uses `server/test-scan.js` and `public/test-embed.html`.

## Architecture

### Two separate runtimes

- **Frontend** (`src/`, `vite.config.ts`): React 19 + TypeScript SPA served by Vite.
- **Backend** (`server/index.js`): Node.js/Express server on port 3001, must be run separately.

### Frontend structure

- **Routing** (`src/App.tsx`): React Router v7. Public pages (Home, Login, Register, Policies, About, Features) and protected pages under a sidebar layout (Dashboard, Consent Management, Policy Management, Settings, Cookie Logs).
- **State** (`src/context/CookieContext.tsx`): Single React Context manages `scannedData` (cookie scan results), `bannerConfig` (theme/position/style), `isPreviewVisible`, and `userId`. Auto-syncs to Supabase with a 1-second debounce.
- **Auth** (`src/lib/supabase.ts`): Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Supports email and Google OAuth.

### Backend API (`server/index.js`)

| Endpoint                  | Description                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/scan`          | Launches Puppeteer, visits the target URL, intercepts all cookies via CDP, categorizes them (Essential / Functional / Analytics / Marketing / Social / Unclassified), returns grouped results. |
| `GET /api/banner/:userId` | Returns the user's banner config and scanned data from Supabase (used by the embed script).                                                                                                    |
| `POST /api/consent`       | Logs visitor consent decisions to the `visitor_consent` table.                                                                                                                                 |

### Embeddable banner (`public/uterms-embed.js`)

Standalone script meant to be dropped on any website. It fetches config from `/api/banner/:userId`, renders the consent banner, stores consent in `localStorage`, and posts decisions back to `POST /api/consent`. The user ID is read from the script's `src` URL parameter.

### Vite plugin (`vite.config.ts` — `resourceBlockerPlugin`)

Serves a dynamically generated JavaScript file at `/resource-blocker/:userId`. This endpoint fetches the user's banner config from Supabase at request time and returns a fully configured inline script.

### Database (Supabase/PostgreSQL)

Key tables:

- `user_cookie_settings` — scanned cookie data and banner config per user
- `visitor_consent` — individual visitor consent decisions (visitor UUID, consent data, URL, IP, user agent)

`user_cookie_settings` schema:
| Column | Type | Description |
|---|---|---|
| `user_id` | uuid | Primary key, FK → `auth.users(id)`, cascade delete |
| `scanned_data` | jsonb | Latest cookie scan results |
| `banner_config` | jsonb | Banner theme/position/style config |
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

### Environment variables

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Set in `.env` at the project root. The backend (`server/index.js`) also connects to Supabase directly via its own REST calls using these same values (or equivalent server-side env vars).
