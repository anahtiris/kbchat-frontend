# Ondamed Support System - Frontend

A RAG-based internal support application built with Next.js, TypeScript, and Tailwind CSS.
This system provides clinical guidelines and instructions for the usage of the **Ondamed** treatment machine.

## Tech Stack
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn UI (inspired)
*   **Icons**: Lucide React
*   **State**: React Context (Auth, i18n, Layout)
*   **Communication**: Fetch API with RAG Backend integration

## Features
*   **Authentication**: Mock Azure Entra ID integration with Role-Based Access Control (Admin, Doctor, Staff).
*   **Ondamed Chat Assistant**: Streaming chat interface that references specific Ondamed manuals for accurate technical guidance.
*   **Manuals & Protocols**: Document management system for Ondamed guidelines.
*   **RAG Configuration**: Strict real-time validation for PDF page boundaries (overlaps, out-of-bounds) to refine AI context.
*   **System Health**: Integrated backend and database connection testers in the Settings module.
*   **Internationalization (i18n)**: Comprehensive English and Thai support for all UI elements and error messages.
*   **Responsive Design**: Mobile-optimized layout with adaptive drawers and environment-aware badges.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```bash
    NEXT_PUBLIC_ENV_NAME=DEV
    NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser. Ensure the Ondamed Python backend is running on port 4000 for full functionality.

## Project Structure
*   `/src/app`: Next.js App Router pages and layouts.
*   `/src/components/features`: Feature-specific components (Auth, Chat, Documents).
*   `/src/components/layout`: Global layout components (Sidebar, TopBar).
*   `/src/components/ui`: Reusable UI atoms (Button, Card, Input).
*   `/src/lib`: Utilities, types, and API connectors.
*   `/src/lib/i18n`: Dictionaries and localization context.
*   `/src/lib/validation`: Strict logic for document boundary validation.

## Deployment
Build for production:
```bash
npm run build
npm start
```
