# Ghost Rave & Awards 2026

Full-stack event voting and ticket sales platform built with React, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: React 18 + Vite + Wouter + TanStack Query + Tailwind + shadcn/ui
- **Backend**: Express 5 + TypeScript (tsx in dev, esbuild bundle in prod)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Session-based (admin) + custom user signup/login

## Local Development

```bash
npm install
npm run db:push     # sync schema to your Postgres
npm run dev         # starts on port 5000
```

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — session encryption key (optional, has fallback)

## Deploy to GitHub

From the Replit shell (or your local terminal):

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If you already have an `origin` remote, use `git remote set-url origin ...` instead.

## Deploy to Render

This repo includes a `render.yaml` blueprint that provisions both the web service and a free PostgreSQL database in one click.

1. Push the repo to GitHub (see above).
2. Go to [Render Dashboard → New → Blueprint](https://dashboard.render.com/blueprints).
3. Connect your GitHub repo and select it.
4. Render will read `render.yaml` and create:
   - A web service (`ghost-awards`) running `npm start`
   - A managed Postgres database (`ghost-awards-db`)
   - `DATABASE_URL` wired automatically
   - `SESSION_SECRET` auto-generated
5. Click **Apply**. First build takes ~3–5 minutes.

The build command runs `npm install && npm run build && npm run db:push`, so your schema is created automatically on first deploy.

### Manual setup (without blueprint)

If you prefer to set it up manually:

1. Create a Postgres instance on Render and copy its **Internal Database URL**.
2. Create a Web Service from your GitHub repo with:
   - **Build Command**: `npm install && npm run build && npm run db:push`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/healthz`
3. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your internal URL>`
   - `SESSION_SECRET=<any long random string>`

## Default Admin Login

- Email: `admin@ghostawards.com`
- Password: `GhostAdmin2026!`

Change these in `server/routes.ts` before going live.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Run dev server (Express + Vite) |
| `npm run build` | Bundle client (Vite) and server (esbuild) into `dist/` |
| `npm start` | Run production server from `dist/index.cjs` |
| `npm run db:push` | Sync Drizzle schema to the database |
| `npm run check` | TypeScript type-check |
