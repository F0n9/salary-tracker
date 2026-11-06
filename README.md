# Salary Tracker

[![Platform: Web / PWA](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-0d1117?style=flat-square&logo=googlechrome&logoColor=white)](https://f0n9.github.io/salary-tracker/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Security: RLS Protected](https://img.shields.io/badge/Security-Row_Level_Security-blue?style=flat-square)](https://supabase.com/docs/guides/auth)
[![Architecture: Vanilla ESM](https://img.shields.io/badge/Architecture-Vanilla_ESM_(No_Build)-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline_First-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A lightweight, production-grade, offline-first shift scheduling and personal compensation tracking Progressive Web Application (PWA). Engineered with zero build steps using native ES Modules, modern CSS Custom Properties, and Supabase PostgreSQL with strict Row Level Security (RLS) for seamless cross-device synchronization.

[Live Demo](https://f0n9.github.io/salary-tracker/) • [Features](#features) • [Directory Structure](#directory-structure) • [Tech Stack](#tech-stack) • [Setup Guide](#getting-started) • [Database Configuration](#database-setup)

---

## Features

- **Automated Earnings Engine:** Pure functional calculations for hourly rates, overtime multipliers, fixed allowances, and deductions. Full support for overnight shifts crossing midnight.
- **Multi-Workplace Management:** Per-workplace wage configuration, custom hourly rates, distinct color palettes, and default workplace assignment.
- **Enterprise-Grade Authentication:**
  - Dual-mode credentials: Sign in or register with either a username or verified email.
  - One-click Google OAuth 2.0 PKCE authentication.
  - User identity linking: Link an existing username/password account with Google in User Profile.
  - Secure email password recovery flow.
- **Database-Enforced Data Isolation (RLS):** Supabase PostgreSQL protected by Row Level Security (RLS) policies scoped strictly to `auth.uid() = user_id`, guaranteeing zero cross-tenant data exposure.
- **Offline-First PWA:** Native Service Worker Cache API (`v122`) with optimistic UI updates, allowing full offline usage with background synchronization upon reconnect.
- **Kinetic UI & Micro-Interactions:**
  - SVG Morphicons with spring physics for theme toggle and password reveal.
  - Apple iOS Ultra-Thin Frosted Glass dockbar (`backdrop-filter: blur(24px) saturate(190%)`).
  - Native-like PWA splash opening sequence with morph transitions.
  - Tactile Web Haptic vibration feedback on mobile touch interactions.
- **Visual Analytics Dashboard:** Multi-period KPIs (current week, last 4 weeks, all-time), interactive daily earnings timelines, workplace distribution breakdowns, and automated monthly reports.
- **Data Portability & Export:**
  - High-DPI payroll summary image generation using the HTML5 Canvas API with clipboard copy and file download.
  - Formatted CSV export for single weeks or grand-total histories.
  - Instant JSON backup and restore.

---

## Directory Structure

```text
salary-tracker/
├── assets/
│   └── icons/                       # High-resolution PWA icons, favicon, and SVG assets
├── css/
│   ├── base.css                     # Reset, design tokens, typography, theme transitions, splash
│   ├── components.css               # Cards, inputs, buttons, wheel selector, frosted dockbar
│   └── modals.css                   # Dialog surfaces, auth forms, responsive tables, dark mode
├── js/
│   ├── services/
│   │   └── supabase.js              # Supabase DB client, OAuth, identity linking, auth & sync
│   ├── ui/
│   │   ├── canvas-slip.js           # Client-side HTML5 Canvas payroll slip generator
│   │   ├── chart.js                 # Chart.js timeline and workplace breakdown renderer
│   │   ├── dialog.js                # Accessible custom confirmation & alert modal dialogs
│   │   ├── export.js                # CSV report generation & JSON backup/restore routines
│   │   ├── haptic.js                # Tactile web vibration feedback controller
│   │   ├── modals.js                # Modal orchestrator, shift editor, and report controller
│   │   ├── select.js                # Custom ergonomic dropdown select component
│   │   └── toast.js                 # Floating snackbar notifications with undo actions
│   ├── vendor/
│   │   └── morphicons/              # Isolated SVG shape morphing runtime
│   ├── app.js                       # Application bootstrapper, DOM bindings, PWA lifecycle
│   ├── calculator.js                # Pure business logic: earnings, hours, OT, tax, date utilities
│   ├── config.js                    # Global constants, API endpoints, palettes, SVG vector paths
│   ├── i18n.js                      # Localization dictionary and translation helpers
│   ├── state.js                     # Central reactive state store and storage key resolvers
│   └── theme.js                     # Dark/Light mode theme engine with View Transitions
├── index.html                       # Semantic HTML5 application shell
├── manifest.json                    # Web App Manifest specification
├── sw.js                            # Service Worker cache management (Offline-First)
├── PRODUCT.md                       # Product requirements, personas, and roadmap
├── DESIGN.md                        # Design system tokens, typographic scales, and color ramps
├── LICENSE                          # MIT License
├── package.json                     # Project metadata
└── README.md                        # Project documentation
```

---

## Tech Stack

| Layer | Technology | Specification / Role |
| :--- | :--- | :--- |
| **Frontend Architecture** | Native Vanilla JavaScript | Standard ES Modules (ESM) without compilers, bundlers, or transpilations |
| **Styling & Tokens** | Modern CSS3 Custom Properties | Design token system, responsive flex/grid layouts, GPU-accelerated motion |
| **Typography** | Be Vietnam Pro & JetBrains Mono | Geometric typography for editorial text paired with tabular monospace numerals |
| **Backend & Auth** | Supabase (PostgreSQL 15) | Relational cloud storage, Google OAuth 2.0 PKCE, identity linking, realtime sync |
| **Data Protection** | Row Level Security (RLS) | Database-level access control enforcing isolated tenant boundaries |
| **Offline Storage** | Service Worker & LocalStorage | Cache-first static asset delivery and optimistic client-side persistence |
| **Visual Rendering** | HTML5 Canvas & Chart.js | High-DPI canvas image generation and interactive statistical charts |
| **Animation Engine** | Morphicons & View Transitions | Vector shape interpolation with spring physics and hardware-accelerated transitions |

---

## Getting Started

### Prerequisites

- Any modern browser supporting native ES Modules (Chrome 61+, Safari 11+, Firefox 60+, Edge 79+).
- A static HTTP file server.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/F0n9/salary-tracker.git
   cd salary-tracker
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8080

   # Or using Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8080` in your web browser.

---

## Database Setup

To provision your Supabase backend, execute the following SQL migration in the **Supabase SQL Editor**:

```sql
create table if not exists public.user_salary_data (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text,
  weeks jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.user_salary_data enable row level security;

create policy "Users can only manage their own salary data"
  on public.user_salary_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Supabase Configuration Checklist

1. **Authentication Providers:**
   - Under **Authentication -> Providers -> Google**: Enter your Google Client ID and Secret. Keep `Skip nonce checks` and `Allow users without an email` turned **OFF**.
2. **Account Linking:**
   - Under **Authentication -> Configuration / Settings**: Enable **"Allow manual linking"** so users can link their username accounts with Google seamlessly.
3. **Environment Parameters:**
   - Update your project credentials in `js/config.js`:
     ```javascript
     export const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
     export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
     ```

---

## PWA Installation

### Mobile Devices (iOS & Android)
- **iOS (Safari):** Tap the **Share** button in the Safari navigation bar and select **"Add to Home Screen"**.
- **Android (Chrome):** Tap the overflow menu (three dots) and select **"Install app"** or **"Add to Home screen"**.

### Desktop (macOS, Windows & Linux)
- In Google Chrome or Microsoft Edge, click the **Install** button located on the right side of the URL omnibox and confirm the installation.

---

## License

This project is open-source and released under the [MIT License](LICENSE).
