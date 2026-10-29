# Salary Tracker

[![Platform: Web](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-0d1117?style=flat-square&logo=googlechrome&logoColor=white)](https://f0n9.github.io/salary-tracker/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Auth: RLS Protected](https://img.shields.io/badge/Security-Row_Level_Security-blue?style=flat-square)](https://supabase.com/docs/guides/auth)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline_First-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

An offline-first shift and salary tracking platform featuring real-time multi-device cloud synchronization through Supabase PostgreSQL, client-side encryption primitives, and high-contrast typography.

## Features

- **Multi-Device Cloud Synchronization:** PostgreSQL cloud persistence paired with strict Row Level Security (RLS) guaranteeing user-level data isolation between mobile and desktop clients.
- **Offline-First Architecture:** Progressive Web App (PWA) service worker integration enabling zero-latency cached startup and seamless offline data entry.
- **24-Hour Time Engine:** Time-tracking interface with instant duration computation, overnight shift boundary handling, and variable hourly wage rates.
- **Compact Payslip Generator:** Native canvas rendering pipeline producing minimal, high-resolution payslips optimized for direct clipboard transfer into messaging channels.
- **Morphic User Interface:** Clean elevation hierarchy utilizing balanced glassmorphism, 1px structural borders, and dedicated monospace readouts via `JetBrains Mono` and `Outfit`.
- **Zero Third-Party Bundler:** Pure web standard execution running directly on static web hosting environments without transpilers or packaging overhead.

## Directory Structure

```text
salary-tracker/
├── assets/
│   └── icons/
│       ├── apple-touch-icon.png
│       ├── favicon.png
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── icon-1024.png
│       └── icon.svg
├── css/
│   ├── base.css
│   ├── components.css
│   ├── modals.css
│   └── main.css
├── js/
│   ├── config.js
│   ├── i18n.js
│   ├── theme.js
│   ├── state.js
│   ├── calculator.js
│   ├── services/
│   │   └── supabase.js
│   ├── ui/
│   │   ├── toast.js
│   │   ├── select.js
│   │   ├── chart.js
│   │   ├── canvas-slip.js
│   │   ├── export.js
│   │   └── modals.js
│   └── app.js
├── index.html
├── manifest.json
├── sw.js
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | Vanilla HTML5 / ES6+ JavaScript (Native ES Modules) | Modular, zero-dependency application logic |
| **Styling** | Modern CSS3 Custom Properties & Component Sheets | Glassmorphic design system and fluid layouts |
| **Typography** | Outfit & JetBrains Mono | Numerical tabular display and ergonomic legibility |
| **Database** | Supabase PostgreSQL Cloud | Encrypted cloud persistence and real-time updates |
| **Access Control** | Supabase Row Level Security (RLS) | Per-user cryptographic row permissions |
| **Offline Cache** | Service Worker API / LocalStorage | Offline capability and asset caching |

## Getting Started

### Local Setup

Clone the repository:

```bash
git clone https://github.com/F0n9/salary-tracker.git
cd salary-tracker
```

Start the application with npm:

```bash
npm start
```

Or serve via any static HTTP server (e.g. Python):

```bash
python -m http.server 8080
```

Access the application at `http://localhost:8080`.

## Cloud Schema & Security Configuration

Execute the following schema in the Supabase SQL Editor to initialize the secure storage table and policies:

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

## Progressive Web App Installation

### Mobile Devices

1. Navigate to the deployed URL via mobile browser.
2. Open browser settings or share drawer.
3. Select **Add to Home Screen**.

### Desktop

1. Open the URL in Google Chrome, Microsoft Edge, or Safari.
2. Click the install icon located within the address bar.
3. Launch as a standalone application window.

## Deployment

Deploy directly to GitHub Pages:

```bash
git remote set-url origin https://github.com/F0n9/salary-tracker.git
git branch -M master
git push -u origin master
```

Enable GitHub Pages under **Repository Settings** > **Pages** by selecting `master` branch and `/ (root)` folder.

## License

Distributed under the [MIT License](LICENSE).
