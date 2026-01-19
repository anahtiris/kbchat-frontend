# Clinic Decision Support - Frontend

A RAG-based internal clinic application built with Next.js, TypeScript, and Tailwind CSS.
Designed for high-trust clinical environments with strict validation, environment awareness, and audit capabilities.

## Tech Stack
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn UI (inspired)
*   **Icons**: Lucide React
*   **State**: React Context (Auth, i18n, Layout)

## Features
*   **Authentication**: Mock Azure Entra ID integration with Role-Based Access Control (Admin, Doctor, Staff).
*   **RAG Chat Interface**: Streaming chat with document context selection.
*   **Document Management**: Upload, list, and configure PDF boundaries for RAG.
*   **Strict Validation**: Real-time validation for RAG page boundaries (overlaps, out-of-bounds).
*   **Internationalization (i18n)**: Full English and Thai support.
*   **Responsive Design**: Mobile-first layout with Drawer navigation and "DEV" environment badges.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```bash
    NEXT_PUBLIC_ENV_NAME=DEV
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
*   `/src/app`: Next.js App Router pages and layouts.
*   `/src/components/features`: Feature-specific components (Auth, Chat, Documents).
*   `/src/components/layout`: Global layout components (Sidebar, TopBar).
*   `/src/components/ui`: Reusable UI atoms (Button, Card, Input).
*   `/src/lib`: Utilities, types, and mock API services.
*   `/src/lib/i18n`: Dictionaries and localization context.

## Deployment
Build for production:
```bash
npm run build
npm start
```
