# Hospitality ERP + Food Cost Intelligence Platform

Production-grade monorepo foundation (no business features yet).

## Monorepo

- `client/` — Vite + React dashboard shell
- `server/` — Node.js + Express API foundation + Prisma (PostgreSQL)

## Prereqs

- Node.js 20+
- PostgreSQL (local or managed)

## Quick start

### 1) Install

```bash
npm install
```

### 2) Environment

Create env files from templates:

- `client/.env` from `client/.env.example`
- `server/.env` from `server/.env.example`

### 3) Run (client + server)

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000
- API health: http://localhost:4000/api/v1/health

## Prisma

Prisma is initialized only (no models yet).

- Generate client:

```bash
npm run prisma:generate
```

- After you add models later, create/apply migrations:

```bash
npm run prisma:migrate
```

## Architecture (high level)

### API flow

`routes → controllers → services → prisma`

### Multi-tenant / SaaS readiness

Foundation is structured for modular growth (ERP modules), future multi-hotel/branch support, and later migration to microservices/queues/websockets without rewriting the codebase.
