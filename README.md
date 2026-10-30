# Salary Tracker

[![Platform: Web / PWA](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-0d1117?style=flat-square&logo=googlechrome&logoColor=white)](https://f0n9.github.io/salary-tracker/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Security: RLS Protected](https://img.shields.io/badge/Security-Row_Level_Security-blue?style=flat-square)](https://supabase.com/docs/guides/auth)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline_First-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A lightweight, offline-first shift scheduling and earnings tracking Progressive Web Application (PWA). Built with standard browser APIs, vanilla JavaScript (ES modules), and Supabase PostgreSQL with Row Level Security (RLS) for real-time cross-device synchronization.

## Features

- **Shift & Earnings Calculation:** Automated computation of work hours, overtime rates, and allowances, with support for overnight shifts spanning past midnight.
- **Multi-Workplace Management:** Per-workplace wage configuration with custom hourly rates and commission tiers.
- **Cross-Device Synchronization:** Automatic cloud synchronization backed by Supabase PostgreSQL and secured by Row Level Security (RLS) policies scoped to authenticated user IDs.
- **Offline-First PWA:** Native service worker caching and local storage persistence enabling complete functionality without network access. Installable on iOS, Android, Windows, and macOS.
- **Canvas Slip Export:** Client-side HTML5 Canvas rendering for high-resolution payroll summary images with one-click clipboard copy and file download.
- **Analytics Dashboard:** Multi-period metrics (current week, last 4 weeks, all-time) with earnings aggregation, hours distribution, and workplace breakdowns.
- **Design System:** Responsive layout optimized for desktop and mobile form factors, high-contrast typography using Be Vietnam Pro and JetBrains Mono, and instant theme switching.

## Directory Structure

```text
salary-tracker/
├── assets/
│   └── icons/
├── css/
│   ├── base.css
│   ├── components.css
│   └── modals.css
├── js/
│   ├── services/
│   │   ├── auth.js
│   │   └── supabase.js
│   ├── ui/
│   │   ├── canvas-slip.js
│   │   ├── chart.js
│   │   ├── modals.js
│   │   ├── render.js
│   │   └── toast.js
│   ├── app.js
│   ├── calculator.js
│   ├── config.js
│   ├── i18n.js
│   ├── state.js
│   └── theme.js
├── index.html
├── manifest.json
├── sw.js
├── package.json
├── LICENSE
└── README.md
```

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Runtime** | Vanilla JavaScript (ES Modules) | Standard browser architecture without build steps or bundlers |
| **Styling** | Modern CSS3 Custom Properties | Design tokens, fluid layout, and CSS-driven theme transitions |
| **Typography** | Be Vietnam Pro & JetBrains Mono | High-legibility text and tabular financial data rendering |
| **Backend & Database** | Supabase (PostgreSQL 15) | Relational storage, user authentication, and realtime sync |
| **Security Layer** | Row Level Security (RLS) | Granular data isolation enforced at the database level |
| **Storage & Cache** | Service Worker Cache API & LocalStorage | Offline capability and optimistic UI updates |
| **Export Engine** | HTML5 Canvas API | High-DPI image generation for shift summary slips |

## Getting Started

### Prerequisites

- Modern web browser with ES module support (Chrome, Edge, Safari, Firefox).
- Any standard static file server.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/F0n9/salary-tracker.git
   cd salary-tracker
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Or using Node.js
   npx serve .
   ```

3. Open `http://localhost:8080` in your browser.

## Database Setup

To configure Supabase storage, execute the following SQL migration in the Supabase SQL Editor:

```sql
create table if not exists public.user_salary_data (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text,
  weeks jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.user_salary_data enable row level security;

create policy "Users can view own data"
  on public.user_salary_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.user_salary_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.user_salary_data for update
  using (auth.uid() = user_id);
```

Set the database connection parameters in `js/config.js`:

```javascript
export const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

## PWA Installation

### Mobile (iOS / Android)
- **iOS (Safari):** Tap the Share button and select "Add to Home Screen".
- **Android (Chrome):** Tap the browser menu and select "Install app" or "Add to Home screen".

### Desktop (Windows / macOS / Linux)
- In Chrome or Edge, click the install icon located on the right side of the omnibox and select "Install".

## License

This project is licensed under the [MIT License](LICENSE).
