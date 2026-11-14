# Phase V1: Simulations of User Types for WorldPosta Unified Sign-In

An early (phase 1) front-end simulation of a unified sign-in portal and account console, exploring UX for different user types. It runs on sample data in the browser; authentication is simulated.

## Features

- **Auth screens:** landing page, login, signup, and email verification.
- **Three user types** (`customer`, `admin`, `reseller`, from `types.ts`) with role-aware navigation under `/app`:
  - Customer: dashboard, profile, billing (email subscriptions, email configurations, CloudEdge configurations), invoices and invoice detail, action logs, team management (add and edit team users), support, settings (account, security, notifications), and notifications.
  - Admin: user management, staff management (with role and status filters, group management), system settings, and an admin dashboard.
  - Reseller: customers, program, and a reseller dashboard.
- **"View As":** an admin can view the customer navigation for a given user through the `viewAsUser` query parameter (`App.tsx`).
- **Email subscriptions page** (`/app/billing/email-subscriptions`) where yearly plans apply a 17% discount (`pages/billing/EmailAdminSubscriptionsPage.tsx`), and a public Posta pricing route (`/posta-pricing`).
- **CloudEdge layout** and dashboard views.
- **Shared UI kit** in `components/ui/`.

## Tech stack

- React 19 and TypeScript
- React Router 7
- Vite 6
- Tailwind CSS and Font Awesome (both loaded from CDNs in `index.html`)

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview the production build
```

No environment variables are needed: this version has no Gemini or other API calls (`vite.config.ts` still defines `GEMINI_API_KEY`, but nothing reads it).

## Project structure

```
App.tsx, index.tsx   Routes and entry point
context.tsx          Simulated auth and app state
data.ts, types.ts    Sample data and types
pages/               auth, admin, billing, customer, dashboard, and layout pages
components/ui/       Shared UI components
```
