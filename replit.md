# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## FlipIQ Dashboard (`artifacts/flipiq-dashboard`)

React + Vite + Tailwind + wouter + shadcn/ui dashboard. Light theme, orange-500 (`#F97316`) as primary accent.

### Routes
- `/` → MyStats (team leaderboard, deal pipeline, agent outreach, performance report, coach chat)
- `/adaptation-reports` → AdaptationReports (AA adaptation tracking, coaching notes)
- `/iq` → iQ Morning Check-in (Screen 1 of 7-step iQ Morning Flow)
- `/iq/tasks` → Today's Tasks summary (Screen 2)
- `/iq/deal-review` → Deal Review — 9 properties in 3 segments (Screen 3)
- `/iq/daily-outreach` → Daily Outreach Campaign Configuration (Screen 4)
- `/iq/priority-agents` → Call Priority Agents — Jose Ponce (Screen 5)
- `/iq/new-relationships` → New Relationship Building + iQ Property Intelligence (Screen 6)
- `/iq/welcome-back` → Welcome Back — resume from last incomplete step (Screen 7)

### iQ Morning Flow
- State persisted to localStorage via `src/lib/iq/storage.ts` (single key `iq:state`, resets daily)
- Mock data in `src/lib/iq/mockData.ts` (9 deal properties, 4 outreach buckets, 1 priority agent, 1 new-relationship deal)
- Shared components: `IqTopBar` (breadcrumb + Next Task + Need Help?), `TaskTipBlock` (orange Task: / blue Tip:)
- Sidebar auto-switches to iQ mode when URL starts with `/iq`, showing only Today's Plan items
- Progressive sidebar unlock: Deal Review appears at screen 3, Daily Outreach at screens 4–6
- "← Back to COMMAND" footer link in iQ sidebar navigates to `/`
