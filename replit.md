# Ghost Awards

## Overview

Ghost Rave & Awards 2026 is a full-stack event voting and ticket sales platform. Users can browse award categories, vote for nominees, and purchase event tickets. The platform features user authentication (signup with email/username/phone/password), a ticket sales system with 7 ticket tiers (Early Bird ₦3,500 limited to 50, Standard ₦5,000, VIP ₦30,000, Bronze/Silver/Gold/Diamond sponsor tables), a user dashboard showing purchased tickets and downloadable virtual tickets, and an admin dashboard for managing votes, nominees, categories, sponsors, and ticket approvals. All payments are manual — users upload proof, admins approve and can send virtual ticket images to users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (strict black & gold #D4AF37 palette)
- **Animations**: Framer Motion for cinematic page transitions and interactions
- **Forms**: React Hook Form with Zod resolvers for validation
- **Layout**: Sidebar-based navigation using shadcn sidebar component
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js with TypeScript (run via tsx)
- **Architecture**: Monolithic server serving both API and static frontend
- **API Design**: REST endpoints defined in `shared/routes.ts` as a typed API contract object with Zod schemas for input validation and response types. Routes follow the pattern `/api/{resource}`
- **Session Management**: express-session with MemoryStore (not persistent across restarts)
- **Authentication**: Hardcoded admin credentials (`admin@ghostawards.com` / `GhostAdmin2026!`), session-based
- **File Uploads**: Multer for handling image uploads (nominee images, payment proof)
- **Build**: Custom build script using esbuild for server and Vite for client. Production output goes to `dist/`

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema** (in `shared/schema.ts`):
  - `categories` — id, name
  - `nominees` — id, categoryId (FK→categories), name, imageUrl, votes (default 0)
  - `payments` — id, fullName, email, phoneNumber, nomineeId (FK→nominees), packageName, votesAmount, amountPaid, proofImageUrl, reference, status, createdAt
  - `users` — id, email (unique), username (unique), phoneNumber, passwordHash, createdAt
  - `ticketPurchases` — id, userId (FK→users), ticketType, amountPaid, proofImageUrl, reference, status (pending/accepted/declined), virtualTicketUrl, createdAt
  - `sponsors` — id, name, imageUrl, isActive
- **Relations**: Categories→Nominees→Payments; Users→TicketPurchases
- **Migrations**: Managed via `drizzle-kit push` (schema push, not migration files)

### Shared Layer
- `shared/schema.ts` — Drizzle table definitions, relations, and insert schemas (via `createInsertSchema`)
- `shared/routes.ts` — Typed API route definitions with paths, methods, Zod input/output schemas. Used by both client hooks and server routes for type safety

### Key Data Flow
1. Admin creates categories and nominees (with images) via dashboard
2. Public users browse categories/nominees, select a vote package (predefined tiers from 4 votes/₦200 to 20,000 votes/₦1,000,000)
3. User fills out voting form, uploads payment proof image, submits
4. Payment record created with "pending" status
5. Admin reviews payment proof in dashboard, approves or rejects
6. On approval, votes are added to the nominee's vote count
7. Leaderboard shows nominees ranked by vote count

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation
- This abstraction allows swapping storage backends if needed

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable using `pg` (node-postgres) pool
- **Google Fonts**: Cinzel, Playfair Display, Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter loaded via CDN
- **Replit Plugins** (dev only): `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`
- **No external payment gateway**: Payment verification is fully manual (upload proof → admin approves)
- **No external auth provider**: Admin auth is hardcoded credentials with server-side sessions
- **Environment Variables Required**:
  - `DATABASE_URL` — PostgreSQL connection string (required)
  - `SESSION_SECRET` — Session encryption key (optional, has fallback default)