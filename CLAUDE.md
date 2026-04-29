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

**The Azure AD client secret must only live on the backend. Never add it to any `NEXT_PUBLIC_` variable.**

## Architecture

**Next.js App Router** with two route groups:
- `(auth)` — unauthenticated pages (`/login`, `/auth/callback`)
- `(dashboard)` — authenticated pages with sidebar/topbar shell (`/dashboard`, `/documents`, `/settings`)

The dashboard layout (`src/app/(dashboard)/layout.tsx`) wraps children in `LayoutProvider` and enforces auth redirect client-side via `useAuth`.

### Context providers (root layout order)

```
LanguageProvider → AuthProvider → ChatSettingsProvider
```

- **AuthProvider** (`src/components/features/auth/auth-context.tsx`): BFF pattern — trusts HttpOnly cookies from the backend. On init, calls `GET /api/auth/me`; falls back to `localStorage` mock user in DEV. Tokens are never stored in localStorage.
- **LanguageProvider** (`src/lib/i18n/context.tsx`): Supports `en` / `th`. Access via `useTranslation()` → `t.<key>`.
- **ChatSettingsProvider** (`src/lib/contexts/chat-settings-context.tsx`): Persists AI model (`ollama` | `gemini`) and relevance threshold to localStorage.

### Auth & RBAC

Roles are defined in `src/lib/constants/auth.ts`: `admin`, `staff`, `viewer`. Permissions map (`PERMISSIONS`) gates document editing to `admin` only. Use `<RoleGuard>` or check `user.role` against `PERMISSIONS.*`.

### Backend API contract

All backend calls use `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:4000`), with `credentials: "include"` for cookie auth.

Key endpoints:
- `POST /api/chat` — streaming SSE chat (line-delimited `data: {...}` with `type: "token" | "status" | "done" | "error"`)
- `GET /api/auth/me` — returns session user
- `POST /api/auth/logout`
- `GET /api/admin/documents`
- `GET /api/admin/services`

The streaming chat parser lives in `src/lib/api/chat-service.ts:56-106`.

### RAG boundary validation

`src/lib/validation/boundaries.ts` contains pure validation logic for PDF page ranges (include/exclude). Boundaries must not overlap and must be within `[1, totalPages]`. This is tested in `boundaries.test.ts` using Vitest.

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`). Always use `@/` imports, never relative `../../`.

### i18n

Add translations to both `en` and `th` entries in `src/lib/i18n/dictionaries.ts`. Components consume them via `const { t } = useTranslation()`.

### DEV-only mock login

When `NEXT_PUBLIC_ENV_NAME=DEV`, the login page exposes role-picker buttons that call `auth.login(role)` directly, bypassing Azure. This stores a mock user in localStorage.
