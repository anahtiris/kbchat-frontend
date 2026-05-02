# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run lint       # Run ESLint
npx vitest         # Run all tests
npx vitest run src/lib/validation/boundaries.test.ts  # Run a single test file
```

The backend (Python) must be running on port 4000 for full functionality. Copy `.env.example` to `.env` before starting. Required vars:
- `NEXT_PUBLIC_BACKEND_URL` — backend base URL
- `NEXT_PUBLIC_AZURE_AD_CLIENT_ID` / `NEXT_PUBLIC_AZURE_AD_TENANT_ID`
- `NEXT_PUBLIC_BLOB_STORAGE_URL` — Azure Blob Storage container URL (e.g. `https://<account>.blob.core.windows.net/<container>`)
- `NEXT_PUBLIC_USE_MOCK_INVENTORY` — set `true` to use in-memory mock data for inventory/procedures (no backend needed)

**The Azure AD client secret must only live on the backend. Never add it to any `NEXT_PUBLIC_` variable.**

## Architecture

**Next.js App Router** with two route groups:
- `(auth)` — unauthenticated pages (`/login`, `/auth/callback`)
- `(dashboard)` — authenticated pages with sidebar/topbar shell (`/dashboard`, `/documents`, `/inventory`, `/procedures`, `/settings`)

The dashboard layout (`src/app/(dashboard)/layout.tsx`) wraps children in `LayoutProvider` and enforces auth redirect client-side via `useAuth`.

### Context providers (root layout order)

```
AppearanceProvider → LanguageProvider → AuthProvider → ChatSettingsProvider
```

- **AppearanceProvider** (`src/lib/contexts/appearance-context.tsx`): Manages `theme` (`light`|`dark`) and `fontSize` (`sm`|`md`|`lg`). Toggles `dark` class on `<html>` and sets `--app-font-size` CSS variable. Persists to localStorage.
- **AuthProvider** (`src/components/features/auth/auth-context.tsx`): BFF pattern — trusts HttpOnly cookies from the backend. On init, calls `GET /api/auth/me`; falls back to `localStorage` mock user in DEV. Tokens are never stored in localStorage.
- **LanguageProvider** (`src/lib/i18n/context.tsx`): Supports `en` / `th`. Access via `useTranslation()` → `t.<key>`.
- **ChatSettingsProvider** (`src/lib/contexts/chat-settings-context.tsx`): Persists AI model (`ollama` | `gemini`) and relevance threshold to localStorage.

### Auth & RBAC

Roles are defined in `src/lib/constants/auth.ts`: `admin`, `staff`, `viewer`. Permissions map (`PERMISSIONS`) gates document editing to `admin` only. Use `<RoleGuard>` or check `user.role` against `PERMISSIONS.*`.

### Backend API contract

All backend calls use `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:4000`), with `credentials: "include"` for cookie auth. **Every new `fetch` to the backend must include `credentials: "include"`, without exception — omitting it silently breaks authentication in production.**

Key endpoints:
- `POST /api/chat` — streaming SSE chat (line-delimited `data: {...}` with `type: "token" | "status" | "done" | "error"`)
- `GET /api/auth/me` — returns session user
- `POST /api/auth/logout`
- `GET /api/admin/documents`
- `GET /api/admin/services`
- `GET /api/inventory/items`, `POST /api/inventory/items`, `PUT /api/inventory/items/:id`
- `POST /api/inventory/movements/receive`, `POST /api/inventory/movements/adjust`
- `GET /api/inventory/items/:id/movements`
- `GET /api/procedures`, `POST /api/procedures`, `PUT /api/procedures/:id`
- `POST /api/procedures/:id/execute` — atomically deducts stock; returns `{execution_id, items: [{item_id, new_quantity}]}`

The streaming chat parser lives in `src/lib/api/chat-service.ts:56-106`.

### Inventory & Procedures module

All calls go through `src/lib/api/inventory-service.ts` (adapter). Set `NEXT_PUBLIC_USE_MOCK_INVENTORY=true` to route to `inventory-mock.ts` in-memory data instead of the real API. Never call `fetch` directly from feature components — always use the service adapter.

Key components:
- `inventory-list.tsx` — table with text search, category/status filters, receive/adjust/edit per row, movement history panel
- `procedure-list.tsx` — card grid with search; Run button opens ProcedureRunner modal
- `procedure-runner.tsx` — stock sufficiency check, inline qty spinners, optimistic deduct on confirm
- `item-form.tsx`, `procedure-form.tsx` — slide-in panels (fixed right, z-50) for admin CRUD
- `movement-history-panel.tsx` — slide-in ledger per inventory item

Slide-in panels use a `z-40` backdrop div + `z-50` panel div pattern. The `Dialog` component (`src/components/ui/dialog.tsx`) is used for modal overlays (procedure runner, stock adjustment).

### Dark mode

Dark mode is class-based (`dark` on `<html>`, toggled by `AppearanceProvider`). All components must include `dark:` variants for background, border, and text colors. The sidebar is always dark (`bg-slate-900`). The main shell background is `bg-slate-50 dark:bg-slate-950`. Shared UI atoms (`Input`, `QuantityInput`, `Dialog`, `Badge`) already include dark variants.

### RAG boundary validation

`src/lib/validation/boundaries.ts` contains pure validation logic for PDF page ranges (include/exclude). Boundaries must not overlap and must be within `[1, totalPages]`. This is tested in `boundaries.test.ts` using Vitest.

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`). Always use `@/` imports, never relative `../../`.

### i18n

Add translations to both `en` and `th` entries in `src/lib/i18n/dictionaries.ts`. Components consume them via `const { t } = useTranslation()`. Never hardcode English strings in components.

### DEV-only mock login

When `NEXT_PUBLIC_ENV_NAME=DEV`, the login page exposes role-picker buttons that call `auth.login(role)` directly, bypassing Azure. This stores a mock user in localStorage.

### Click-outside pattern for dropdowns

Use a `useRef` on the container div and a `document` `mousedown` listener in a `useEffect` — do not use a `fixed inset-0 z-index:-10` backdrop div, which does not intercept clicks over normal page content. See `src/components/features/chat/scope-selector.tsx` for the reference implementation.

### Known remaining issues

- **`message-bubble.tsx`** — `handleSourceClick` passes `selectedServiceId` (a number) where the PDF URL expects a service name string when `source.service_name` is missing.
- **`document-registration.tsx:35`** — Validation error `"All fields are required"` is hardcoded English; should use a `t.*` key.
- **`service-manager.tsx:82`** — Delete confirmation uses `window.confirm()`, which is not i18n'd and is blocked in some browser contexts (iframes, strict CSP). Should be replaced with a proper dialog.
- **`procedure-form.tsx:96`** — `"Procedure name is required."` error message is hardcoded English; should use a `t.*` key.
