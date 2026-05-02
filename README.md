# ClinicOS — Frontend

A clinic operations platform built with Next.js, TypeScript, and Tailwind CSS. Combines a RAG-powered knowledge assistant with inventory management and procedure execution workflows.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with class-based dark mode
- **Icons**: Lucide React
- **State**: React Context (Auth, i18n, Appearance, Layout, ChatSettings)
- **Communication**: Fetch API with streaming SSE support

## Features

- **Chat Assistant**: Streaming RAG chat that references clinic manuals for accurate answers.
- **Inventory Management**: Track consumables and supplies with movement history, stock adjustments, and low-stock alerts.
- **Procedure Execution**: Run procedure templates with auto-loaded consumables; single-action stock deduction with stock sufficiency checks.
- **Manuals & Protocols**: PDF document management with RAG page-boundary configuration.
- **Authentication**: Azure Entra ID via backend BFF (HttpOnly cookies). Roles: `admin`, `staff`, `viewer`.
- **Appearance**: Light/dark theme and font size settings, persisted to localStorage.
- **Internationalization**: English and Thai throughout (dictionaries in `src/lib/i18n/dictionaries.ts`).
- **System Health**: Backend and database connection testers in Settings (admin only).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup** — copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_BACKEND_URL` — Python backend base URL (default `http://localhost:4000`)
   - `NEXT_PUBLIC_AZURE_AD_CLIENT_ID` / `NEXT_PUBLIC_AZURE_AD_TENANT_ID` — Azure Entra ID app registration
   - `NEXT_PUBLIC_BLOB_STORAGE_URL` — Azure Blob Storage container URL for uploaded PDFs
   - `NEXT_PUBLIC_ENV_NAME` — set to `DEV` to enable mock role-picker on the login page
   - `NEXT_PUBLIC_USE_MOCK_INVENTORY` — set to `true` to use in-memory mock data for inventory/procedures

   The Azure AD client secret must only be configured on the backend, never in `.env`.

3. **Run dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). The Python backend must be running on port 4000 for full functionality.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npx vitest         # Run tests
```

## Project Structure

```
src/
  app/
    (auth)/          # Login, OAuth callback
    (dashboard)/     # Authenticated pages: chat, inventory, procedures, documents, settings
  components/
    features/        # Domain components: auth, chat, documents, inventory, procedures
    layout/          # Sidebar, TopBar, LayoutContext
    ui/              # Atoms: Button, Card, Input, Dialog, Badge, QuantityInput
  lib/
    api/             # inventory-service.ts (adapter), inventory-mock.ts, chat-service.ts
    contexts/        # AppearanceContext, ChatSettingsContext
    i18n/            # dictionaries.ts (en + th), context
    types/           # Shared TypeScript interfaces
    validation/      # PDF boundary validation (tested with Vitest)
```

## Deployment

```bash
npm run build
npm start
```
