# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a SaaS system for clothing store management with three independent packages (each has its own `node_modules` and `package.json` — no root-level workspace configuration):

- `web_tienda/` — Next.js web storefront
- `backend/` — Express API + Prisma ORM
- `app_movil/` — Expo React Native mobile app

## Commands

All commands must be run from within the respective package directory.

### web_tienda (Next.js)
```bash
cd web_tienda
npm run dev      # development server
npm run build    # production build
npm run lint     # ESLint
```

### backend (Express + Prisma)
```bash
cd backend
npx prisma migrate dev   # run migrations
npx prisma generate      # regenerate client after schema changes
```
No `dev` or `build` scripts are defined yet — `src/server.ts` is empty.

### app_movil (Expo)
```bash
cd app_movil
npm start           # Expo dev server
npm run android     # Android emulator
npm run ios         # iOS simulator
npm run lint        # ESLint
```

## Architecture

### web_tienda
- **Next.js App Router** (Next.js 16 — see warning below), React 19, Tailwind CSS v4, TypeScript strict mode
- Routes live in `app/` using file-based routing
- Path alias `@/*` → project root
- **IMPORTANT**: This version of Next.js has breaking changes from prior versions. Always read `node_modules/next/dist/docs/` before writing any Next.js-specific code. APIs, conventions, and file structure may differ from training data.

### backend
- Express 5, TypeScript strict mode
- Intended controller-service pattern: `src/controllers/` and `src/routes/` directories exist but are empty
- **Prisma ORM**: schema at `prisma/schema.prisma`, client generated to `../generated/prisma`
- Database URL comes from `backend/.env` (`DATABASE_URL` env var) — PostgreSQL via `prisma+postgres`
- Prisma config file: `backend/prisma.config.ts`

### app_movil
- Expo Router (file-based routing) with role-based route groups inside `app/`:
  - `(auth)/` — authentication flows
  - `(tabs)/` — main tab navigation
  - `employee/` — employee-specific screens
  - `owner/` — owner-specific screens
- React Native Vision Camera included as dependency
- Path alias `@/*` configured in tsconfig

## Key Relationships

- The backend is the single data source for both `web_tienda` and `app_movil`
- Database schema in `backend/prisma/schema.prisma` is currently empty (only generators defined) — models need to be added before running migrations
- All three packages use TypeScript with strict mode enabled
