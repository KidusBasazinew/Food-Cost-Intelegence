# Server (API Foundation)

Node.js + Express foundation for the Hospitality ERP platform.

## Stack

- Express
- Prisma ORM (PostgreSQL)
- JWT foundation + bcrypt helpers
- Zod validation middleware
- Security middleware: `helmet`, `cors`, `cookie-parser`, `compression`, `express-rate-limit`

## Environment

Create `server/.env` from `server/.env.example`.

## Run

From the monorepo root:

```bash
npm run dev:server
```

## API structure

`routes → controllers → services → prisma`

## Health check

- `GET /healthz`
- `GET /api/v1/health`
