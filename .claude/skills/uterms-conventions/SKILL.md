# uTerms Conventions

This skill summarizes the patterns and conventions used in the uTerms codebase.

## Policy pages pattern

All policy types follow the same two-component pattern:

### Management page (list/delete)
Use `ManagementPage` from `src/components/ManagementPage.tsx`. Pass all config as props — do NOT duplicate logic.

```tsx
import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const MyPolicyManagement: React.FC = () => (
  <ManagementPage
    table="my_policy_table"
    title="My Policy"
    description="Generate and manage your My Policies using our step-by-step wizard."
    basePath="/my-policy"
    emptyText="No My Policies yet."
    emptySubText="Use our step-by-step wizard to create your first My Policy."
    createLabel="Create My Policy"
    deleteConfirm="Delete this My Policy? This cannot be undone."
  />
);
```

The hook `useManagementPolicy(table)` handles all data fetching, loading state, and deletion. It lives in `src/hooks/useManagementPolicy.ts`.

### Preview page (view/publish/embed)
Use `PreviewPage` from `src/components/PreviewPage.tsx`. Pass all config as props.

```tsx
import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const MyPolicyPreview: React.FC = () => (
  <PreviewPage
    table="my_policy_table"
    backPath="/my-policy"
    basePath="/my-policy"
    policyLabel="My Policy"
    embedDivId="uterms-my-policy"
    embedDivLabel="the My Policy"
    embedScriptFile="uterms-my-policy-embed.js"
    testPage="test-my-policy.html"
  />
);
```

The hook `usePreviewPolicy(table)` handles fetching, copy/download, publish toggle, and embed copy. It lives in `src/hooks/usePreviewPolicy.ts`.

## Existing policy tables

| Policy | table | basePath |
|---|---|---|
| Privacy Policy | privacy_policies | /policy-management |
| Cookie Policy | cookie_policies | /cookie-policy |
| Terms of Service | terms_of_service | /terms-of-service |
| EULA | eula | /eula |
| Return Policy | return_policy | /return-policy |
| Disclaimer | disclaimer | /disclaimer |
| Shipping Policy | shipping_policy | /shipping-policy |
| Acceptable Use Policy | acceptable_use_policy | /acceptable-use-policy |
| Impressum | impressum | /impressum |
| Accessibility Statement | accessibility_statement | /accessibility-statement |

## HTML-to-text conversion

Use `htmlToText()` from `src/utils/htmlToText.ts` when converting policy HTML for clipboard copy or download. It strips tags and normalizes HTML entities.

## Supabase key tables

- `user_cookie_settings` — scanned data + banner config per user (primary key: user_id)
- `visitor_consent` — visitor consent logs
- `gcm_scan_results` — GCM v2 compliance scan per user (unique on user_id)

## State management

`CookieContext` (src/context/CookieContext.tsx) provides:
- `userId` — authenticated user ID
- `scannedData` — cookie scan results
- `bannerConfig` — banner theme/position/style
- `isAuthLoading` — auth loading state

Auto-syncs to Supabase with 1-second debounce.

## CSS

- Management pages use `PolicyManagement.css` classes: `pm-container`, `pm-header`, `pm-table`, `pm-status-badge`, `pm-actions`, `pm-empty`, `btn-create`
- Preview pages use `PolicyPreview.css` classes: `preview-container`, `preview-topbar`, `preview-back-btn`, `preview-actions`, `preview-btn`, `status-badge`, `preview-meta`, `preview-doc-wrapper`, `embed-section`, `embed-code-block`

## Backend

Express server at `server/index.js` on port 3001. Key endpoints:
- `POST /api/scan` — Puppeteer cookie scan
- `GET /api/banner/:userId` — banner config for embed script
- `POST /api/consent` — log visitor consent
- `POST /api/gcm-scan` — GCM v2 compliance scan

## Adding a new policy type

1. Create Supabase table with columns: `id uuid PK`, `user_id uuid FK`, `title text`, `status text`, `generated text`, `updated_at timestamptz`
2. Add route to `src/App.tsx` for management, preview, and wizard pages
3. Add sidebar entry to `src/components/Sidebar.tsx`
4. Create Management page as thin wrapper using `ManagementPage`
5. Create Preview page as thin wrapper using `PreviewPage`
6. Create Wizard page in `src/pages/`
7. Create generator utility in `src/utils/generate*.ts`
8. Create embed JS file in `public/uterms-*-embed.js`
