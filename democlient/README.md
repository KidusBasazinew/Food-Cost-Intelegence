# Client (Dashboard Shell)

Vite + React foundation for a luxury ERP dashboard UI.

## Stack

- React + React Router
- Tailwind CSS
- ShadCN UI base configuration (CSS variables + aliases)
- TanStack React Query
- Axios
- Zustand
- React Hook Form + Zod
- Sonner (toasts)

## Environment

Create `client/.env` from `client/.env.example`:

```bash
VITE_API_URL=http://localhost:4000/api/v1
```

## Run

From the monorepo root:

```bash
npm run dev:client
```

Or run both client + server:

```bash
npm run dev
```
