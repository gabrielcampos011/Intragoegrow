# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corporate training intranet ("Intranet de Treinamentos") for GoGrow. Employees can watch videos and read PDFs with automatic progress tracking. Admins manage content and users.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No lint or test commands are configured.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Supabase** — PostgreSQL, Auth (email/password), RLS
- **Tailwind CSS v4** — no component libraries, fully custom components
- **react-player** for video, **react-pdf** for PDFs
- **React Compiler** enabled via `babel-plugin-react-compiler`

## Architecture

### Auth & Routing

- `src/app/middleware.ts` runs on every request: refreshes session cookies, then redirects based on role
- Role check reads from `profiles.role`; `src/lib/role.ts` normalizes variants ('administrador' → 'admin', 'colaborador' → 'user')
- Unauthenticated → `/login`; users accessing `/admin` → `/dashboard`; admins accessing `/dashboard` → `/admin` (or vice versa)

### Server vs Client split

- Pages are Server Components by default and fetch data directly via `createClient()` from `src/lib/supabase/server.ts`
- Mutations use Server Actions (`'use server'` in `actions.ts` files)
- Client components (`'use client'`) are used for interactive features: progress tracking, modal dialogs, the main dashboard list
- Supabase browser client lives in `src/lib/supabase/client.ts`

### Database schema (Supabase/PostgreSQL)

| Table | Key columns |
|-------|------------|
| `profiles` | `id` (FK auth.users), `name`, `role` ('user'/'admin'), `sector_id` |
| `sectors` | `id`, `name` |
| `contents` | `id`, `title`, `type` ('video'/'pdf'/'link'), `url`, `sector_id` (null = global) |
| `progress` | `user_id`, `content_id`, `position` (seconds or page), `completed` (bool) — unique on (user_id, content_id) |

RLS policies: users read/write own data only; admins read all; all authenticated users read contents and sectors; only admins write contents/sectors.

### Progress tracking

- `src/hooks/useProgress.ts` — loads saved position on mount, exposes `saveProgress()` (upsert)
- `src/hooks/useContents.ts` — fetches contents filtered by the user's sector (global + sector-specific)
- Video: saves every 10 seconds; auto-completes at 90% watched; seeks to saved position on load
- PDF: saves page on each navigation; auto-completes on last page
- `position` = seconds for video, page number for PDF

### Styling

Brand tokens in `src/app/globals.css`:
- `--color-gogrow-red: #E30613`
- `--color-gogrow-black: #0D0D0D`
- `--color-gogrow-gray-dark: #1A1A1A`
- `--color-gogrow-gray-light: #F5F5F5`
- Custom utilities: `bg-black-gradient`, `bg-red-gradient`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=       # Public — safe for browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key
SUPABASE_SERVICE_ROLE_KEY=      # Server-only — never expose to client
```

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
