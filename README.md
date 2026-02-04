# Logbook

Minimal SvelteKit logbook for daily tracking:
- Weight (kg)
- Trained BJJ (yes/no) + optional rating (1–5)
- Went to gym (yes/no) + optional rating (1–5)
- Day rating (1–5)
- Optional comments per field

## Stack
- SvelteKit + TypeScript
- SQLite + Prisma
- Auth.js (Google SSO only)
- Chart.js (client-side only)
- Flatpickr date picker (dd/MM/yyyy)

## Setup
```sh
pnpm install
cp .env.example .env
```

Update `.env` with Google OAuth + Auth.js secrets, then:
```sh
pnpm prisma migrate dev
pnpm run dev
```

## Environment variables
- `DATABASE_URL` (SQLite file path, e.g. `file:./dev.db`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET` (random string, at least 32 chars)
- `AUTH_TRUST_HOST=true` (required for local dev)

## Google OAuth setup (quick)
1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create OAuth client ID (Web application).
3. Authorized redirect URIs: `http://localhost:3000/auth/callback/google`
4. Copy client ID/secret into `.env`.

## Notes
- Dates are normalized to **local midnight** before storing. This avoids timezone drift when selecting a day in the date picker.
- The database is SQLite at `prisma/dev.db` (configured in `.env`).
- The auth migration recreates the Entry table to add `userId`. Existing entries will be removed. If you need to keep old data, export it first.
