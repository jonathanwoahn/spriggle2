# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server on port 3010
pnpm build        # Production build
pnpm start        # Start production server
pnpm drizzle-kit push  # Push schema changes to database
pnpm drizzle-kit generate  # Generate migrations
```

## Architecture

This is a Next.js 15+ audiobook platform using React 19, designed as a white-label solution for publishers.

### Tech Stack

- **Database**: Neon PostgreSQL with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: NextAuth.js v5 with credentials provider
- **External**: Cashmere API (`https://omnibk.ai/api/v2`) for book content, OpenAI for TTS

### Key Directories

- `app/` - Next.js App Router pages and API routes
  - `(auth-pages)/` - Authentication pages (sign-up, sign-in, forgot-password)
  - `admin/` - Protected admin dashboard
  - `book/[id]/` - Book detail and playback pages
  - `api/` - Backend API routes
- `components/` - React components
  - `ui/` - Base UI components (shadcn/ui style)
- `lib/` - Core business logic
  - `cashmere.ts` - External book content API client
  - `storage.ts` - Cloudflare R2 storage client
  - `auth.ts` - Auth helper functions
  - `types.ts` - TypeScript interfaces
- `db/` - Database layer
  - `schema.ts` - Drizzle ORM schema definitions
  - `index.ts` - Database client export
- `context/` - React Context providers

### Database Schema (db/schema.ts)

- `users` - User accounts with email/password auth
- `sessions` - User sessions (JWT-based)
- `jobs` - Processing queue for audio/metadata generation
- `blockMetadata` - Content metadata with embeddings
- `appSettings` - Application configuration (API keys, etc.)
- `collections` - Book collections
- `collectionBooks` - Collection-book relationships
- `reporting` - License usage reporting

### Storage (lib/storage.ts)

R2 storage functions:
- `uploadFile(path, data, contentType)` - Upload file
- `downloadFile(path)` - Download file as Buffer
- `listFiles(prefix)` - List files with prefix
- `fileExists(path)` - Check if file exists
- `getFileWithRange(path, range?)` - Get file with optional range request (for audio streaming)

### Job Processing System

The app uses an async job queue for audiobook generation. Job types flow in order:
1. `CREATE_JOBS` - spawns all sub-jobs
2. `TEXT_TO_AUDIO_META` - convert text to audio
3. `SECTION_CONCAT_META` - concatenate chapter audio
4. `BOOK_SUMMARY` - generate summary
5. `SUMMARY_EMBEDDING` - create vector embedding
6. `BOOK_META` - mark book ready

Jobs have states: `pending` → `processing` → `completed`/`failed`, or `waiting` for dependencies.

### Authentication

- **Config**: `auth.ts` - NextAuth configuration with credentials provider
- **Helpers**: `lib/auth.ts` - `getSession()`, `isAdmin()`, `isUser()`, `requireAuth()`, `getUserId()`
- **Route handler**: `app/api/auth/[...nextauth]/route.ts`
- **Middleware**: `middleware.ts` - Protects routes via NextAuth
- **First user rule**: First registered user automatically becomes admin

### Server Actions

Form handlers in `app/actions.ts`:
- `signUpAction` - Register new user
- `signInAction` - Sign in with credentials
- `signOutAction` - Sign out
- `forgotPasswordAction` - Request password reset (requires SMTP config)
- `saveSettings` - Save app settings (admin only)
- `getJobCount` - Get job statistics

### Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `CLOUDFLARE_*` - R2 storage credentials
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - App URL for auth callbacks

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`)

### Styling

- Material-UI (MUI) for components
- Tailwind CSS for utilities
- Radix UI primitives for accessible components
- Framer Motion for animations
- Light mode only (no dark mode)

**Brand & Style Guide**: See `.claude/output-styles/brand-style-guide.md` for colors, typography, component patterns, and hero animation details.

## Publisher Setup (White-Label)

To deploy as a new instance:
1. Create Neon account and project
2. Create Cloudflare R2 bucket
3. Set environment variables
4. Run `pnpm drizzle-kit push` to create tables
5. Deploy to Vercel (or similar)
6. First user to register becomes admin
