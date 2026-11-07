# Salary Tracker

[![Platform: Web / PWA](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-0d1117?style=flat-square&logo=googlechrome&logoColor=white)](https://f0n9.github.io/salary-tracker/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Security: RLS](https://img.shields.io/badge/Security-Row_Level_Security-blue?style=flat-square)](https://supabase.com/docs/guides/auth)
[![Architecture: Vanilla ESM](https://img.shields.io/badge/Architecture-Vanilla_ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

An offline-first, zero-build Progressive Web App (PWA) for shift scheduling and personal earnings tracking, backed by Supabase PostgreSQL with strict Row Level Security (RLS).

[**Live Demo →**](https://f0n9.github.io/salary-tracker/)

---

## Highlights

- **Shift & Wage Calculation:** Automated hours diff, overnight shifts crossing midnight, custom overtime rates, allowances, and deductions.
- **Multi-Workplace:** Per-workplace hourly rates, visual color-coding, and custom presets.
- **Authentication:** Dual login (Username or Email), 1-click Google OAuth 2.0 PKCE, account identity linking, and email password recovery.
- **Security by Design:** Database-enforced Row Level Security (RLS) ensuring strict personal data isolation (`auth.uid() = user_id`).
- **Offline PWA:** Service Worker Cache API with optimistic local persistence and automatic cloud sync.
- **Refined UX:** SVG Morphicons, iOS frosted glass dockbar, haptic feedback, Canvas payslip exports, and CSV summaries.

---

## Architecture

```text
salary-tracker/
├── assets/icons/       # PWA icons & branding
├── css/                # Base tokens, component styling, and modal views
├── js/
│   ├── services/       # Supabase client, auth & realtime sync
│   ├── ui/             # Modals, charts, canvas payslip, export & haptics
│   ├── vendor/         # Isolated Morphicons runtime
│   ├── calculator.js   # Pure wage & hours business logic
│   ├── state.js        # Reactive central state store
│   └── app.js          # App orchestrator & event bindings
├── index.html          # Semantic application shell
└── sw.js               # Offline-first Service Worker
```

---

## Quick Start

```bash
git clone https://github.com/F0n9/salary-tracker.git
cd salary-tracker
npx serve .
# Or: python -m http.server 8080
```

---

## Database Setup

Run this in your **Supabase SQL Editor**:

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

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;

create or replace function public.get_login_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from auth.users u
  left join public.user_salary_data s on s.user_id = u.id
  where lower(s.username) = lower(p_username)
     or lower(u.raw_user_meta_data->>'username') = lower(p_username)
  limit 1;
  return v_email;
end;
$$;

grant execute on function public.get_login_email(text) to anon, authenticated;
```

Set your credentials in `js/config.js` and enable **"Allow manual linking"** in Supabase Auth Settings.

---

## License

[MIT](LICENSE)
