# Spriggle

An AI-powered audiobook platform for children's books, designed as a white-label solution for publishers.

## Tech Stack

- **Framework**: Next.js 15+ with React 19
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: NextAuth.js v5 with credentials provider
- **External APIs**: Cashmere API (book content), OpenAI (text-to-speech)

## Quick Start

1. Clone and install dependencies:
   ```bash
   pnpm install
   ```

2. Set up external services:
   - Create a [Neon](https://neon.tech) account and project
   - Create a [Cloudflare R2](https://dash.cloudflare.com) bucket

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. Initialize the database:
   ```bash
   pnpm drizzle-kit push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Register the first user account - they will automatically become admin.

## Environment Variables

See `.env.example` for required variables:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID` - R2 access key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY` - R2 secret key
- `CLOUDFLARE_R2_BUCKET_NAME` - R2 bucket name
- `NEXTAUTH_SECRET` - Auth encryption key (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL

## Commands

```bash
pnpm dev          # Start development server (port 3010)
pnpm build        # Production build
pnpm start        # Start production server
pnpm drizzle-kit push      # Push schema changes to database
pnpm drizzle-kit generate  # Generate migrations
```

## Architecture

### Key Directories

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Core business logic (Cashmere client, storage, auth helpers)
- `db/` - Database schema and client

### Job Processing

The app uses an async job queue for audiobook generation:

1. `CREATE_JOBS` - Spawns all sub-jobs
2. `TEXT_TO_AUDIO_META` - Convert text to audio
3. `SECTION_CONCAT_META` - Concatenate chapter audio
4. `BOOK_SUMMARY` - Generate summary
5. `SUMMARY_EMBEDDING` - Create vector embedding
6. `BOOK_META` - Mark book ready

### Admin Dashboard

Access `/admin` to:
- Configure API keys (Cashmere, OpenAI)
- Manage book collections
- Trigger audiobook generation jobs
- Monitor job status

## For Publishers (White-Label)

To deploy your own instance:

1. Fork this repository
2. Create Neon and Cloudflare R2 accounts
3. Set environment variables
4. Deploy to Vercel (or similar)
5. First registered user becomes admin

## Notes

- Uses browser service workers for job processing to work within Vercel's free tier limits
- Higher quality audio generation may require external processing endpoints due to memory/timeout constraints
- The Cashmere API handles book content licensing and reporting

## TODO

### MVP
- [ ] Enable Media Session API for cover image, book title, chapter display
- [ ] Build background worker for automatic job processing

### Nice to Haves
- [ ] Admin role management
- [ ] Tagging system for books
- [ ] Site activity monitoring
- [ ] Social sign-in (Google Auth)
