# CareNexus - Care Management Portal

A comprehensive care management portal inspired by GuidingCare, built as a single-page application.

## Backend Setup

The initial backend lives in `server/` and uses Node.js, Express, PostgreSQL, Prisma, and JWT authentication.

### Prerequisites

- Node.js 20 or newer
- PostgreSQL 14 or newer

### Install and configure

```bash
cd server
pnpm install
cp .env.example .env
```

Update `.env` with your PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET`.

### Database

```bash
pnpm run prisma:generate
pnpm run prisma:migrate -- --name init
```

Create at least one user in the `users` table with a bcrypt password hash before calling `POST /api/auth/login`.

### Run the API

```bash
pnpm run dev
```

The API defaults to `http://localhost:4000`.

### Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`

All member endpoints require an `Authorization: Bearer <token>` header.
