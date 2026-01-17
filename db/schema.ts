import { pgTable, serial, text, timestamp, jsonb, integer, boolean, uniqueIndex, index, vector } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user'), // 'user' | 'admin'
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sessions table for auth (used by NextAuth with JWT, but keeping for flexibility)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
});

// Block metadata - stores content metadata for books
export const blockMetadata = pgTable('block_metadata', {
  id: serial('id').primaryKey(),
  bookId: text('book_id').notNull(),
  blockId: text('block_id').notNull(),
  sectionOrder: integer('section_order'),
  blockIndex: integer('block_index'),
  type: text('type'), // 'text' | 'section' | 'book'
  data: jsonb('data'),
  embedding: text('embedding'), // Store as JSON string, convert to vector if needed
  coverColors: jsonb('cover_colors'), // { vibrant, muted, darkVibrant, darkMuted, lightVibrant, lightMuted }
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  bookIdIdx: index('block_metadata_book_id_idx').on(table.bookId),
  blockIdBookIdIdx: uniqueIndex('block_metadata_block_id_book_id_idx').on(table.blockId, table.bookId),
  typeCreatedAtIdx: index('block_metadata_type_created_at_idx').on(table.type, table.createdAt),
}));

// Jobs table - processing queue for audio generation
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  jobType: text('job_type').notNull(),
  status: text('status').default('pending'), // 'pending' | 'processing' | 'completed' | 'failed' | 'waiting'
  data: jsonb('data'),
  log: jsonb('log').default([]),
  dependencies: jsonb('dependencies').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  statusIdx: index('jobs_status_idx').on(table.status),
}));

// App settings - key-value configuration store
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  field: text('field'),
  description: text('description'),
  type: text('type').default('string'), // 'string' | 'boolean'
  order: integer('order').default(0),
});

// Collections - groups of books
export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nameIdx: index('collections_name_idx').on(table.name),
}));

// Collection books - many-to-many relationship between collections and books
export const collectionBooks = pgTable('collection_books', {
  id: serial('id').primaryKey(),
  collectionId: integer('collection_id').references(() => collections.id, { onDelete: 'cascade' }),
  bookId: text('book_id').notNull(),
  order: integer('order').default(0),
}, (table) => ({
  collectionIdIdx: index('collection_books_collection_id_idx').on(table.collectionId),
}));

// Reporting - license usage tracking
export const reporting = pgTable('reporting', {
  id: text('id').primaryKey(),
  blockId: text('block_id').notNull(),
  licenseType: text('license_type').notNull(),
  data: jsonb('data'),
  timestamp: timestamp('timestamp').defaultNow(),
  syncedAt: timestamp('synced_at'),
  transactionId: text('transaction_id'),
}, (table) => ({
  blockIdIdx: index('reporting_block_id_idx').on(table.blockId),
}));

// Setup status - tracks first-run setup wizard completion
export const setupStatus = pgTable('setup_status', {
  id: serial('id').primaryKey(),
  step: text('step').notNull(), // 'database' | 'admin' | 'api_keys' | 'complete'
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
});

// Book voices - tracks which voices have been used for each book (supports multiple voices per book)
export const bookVoices = pgTable('book_voices', {
  id: serial('id').primaryKey(),
  bookId: text('book_id').notNull(),
  voiceId: text('voice_id').notNull(),
  provider: text('provider').notNull().default('elevenlabs'), // 'elevenlabs' | 'openai'
  voiceName: text('voice_name'),
  isDefault: boolean('is_default').default(false),   // Default voice for this book
  status: text('status').default('pending'),         // 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  bookVoiceProviderIdx: uniqueIndex('book_voices_book_voice_provider_idx').on(table.bookId, table.voiceId, table.provider),
  bookIdIdx: index('book_voices_book_id_idx').on(table.bookId),
}));

// Block timestamps - maps audio playback positions to Cashmere block IDs
// Now includes voiceId to support multiple voice versions per book
export const blockTimestamps = pgTable('block_timestamps', {
  id: serial('id').primaryKey(),
  bookId: text('book_id').notNull(),
  voiceId: text('voice_id').notNull(),              // Voice used for this audio
  sectionOrder: integer('section_order').notNull(),
  blockId: text('block_id').notNull(),
  startTimeMs: integer('start_time_ms').notNull(),
  endTimeMs: integer('end_time_ms').notNull(),
  characterStart: integer('character_start'),
  characterEnd: integer('character_end'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  bookSectionVoiceIdx: index('block_timestamps_book_section_voice_idx').on(table.bookId, table.sectionOrder, table.voiceId),
  blockIdIdx: index('block_timestamps_block_id_idx').on(table.blockId),
  voiceIdIdx: index('block_timestamps_voice_id_idx').on(table.voiceId),
}));

// Ingestion status - tracks book ingestion progress
export const ingestionStatus = pgTable('ingestion_status', {
  id: serial('id').primaryKey(),
  bookId: text('book_id').notNull().unique(),
  status: text('status').default('pending'), // 'pending' | 'in_progress' | 'completed' | 'failed'
  triggerRunId: text('trigger_run_id'),
  totalSections: integer('total_sections'),
  completedSections: integer('completed_sections').default(0),
  error: text('error'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  bookIdIdx: index('ingestion_status_book_id_idx').on(table.bookId),
}));

// Nav item structure from Cashmere
export interface OmnipubNavItem {
  order: number;
  label: string;
  matter?: string; // 'frontmatter' | 'bodymatter' | 'backmatter' | 'body'
}

// Omnipubs - dedicated table for book/title metadata (replaces blockMetadata type='book')
export const omnipubs = pgTable('omnipubs', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),              // Cashmere UUID
  externalId: text('external_id'),                    // Optional external reference
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  creators: jsonb('creators').$type<string[]>(),     // Array of author names
  publisher: text('publisher'),
  creationDate: timestamp('creation_date'),
  coverImage: text('cover_image'),                    // URL to cover
  coverColors: jsonb('cover_colors'),                 // Color palette
  nav: jsonb('nav').$type<OmnipubNavItem[]>(),       // Table of contents / chapters

  // Ingestion outputs
  summary: text('summary'),                           // Generated summary
  embedding: vector('embedding', { dimensions: 1536 }), // pgvector for semantic search
  totalDuration: integer('total_duration'),           // Total audio duration (ms)

  // Status flags
  ready: boolean('ready').default(false),             // Available for consumption

  // Timestamps
  cashmereStoredAt: timestamp('cashmere_stored_at'),  // When reported to Cashmere
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uuidIdx: uniqueIndex('omnipubs_uuid_idx').on(table.uuid),
  readyIdx: index('omnipubs_ready_idx').on(table.ready),
}));

// Voices - library of available TTS voices (ElevenLabs, OpenAI, user-uploaded)
export const voices = pgTable('voices', {
  id: serial('id').primaryKey(),
  voiceId: text('voice_id').notNull(),                // Provider's voice ID
  provider: text('provider').notNull().default('elevenlabs'), // 'elevenlabs' | 'openai'
  name: text('name').notNull(),
  description: text('description'),
  previewUrl: text('preview_url'),                    // Audio preview URL

  // Ownership
  ownerType: text('owner_type').notNull(),            // 'stock' | 'user'
  ownerId: text('owner_id'),                          // User ID if user-uploaded

  // Voice characteristics (provider-specific)
  labels: jsonb('labels'),                            // { accent, age, gender, etc. }

  // Status
  isActive: boolean('is_active').default(true),       // Available for selection

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  voiceProviderIdx: uniqueIndex('voices_voice_provider_idx').on(table.voiceId, table.provider),
  ownerTypeIdx: index('voices_owner_type_idx').on(table.ownerType),
  providerIdx: index('voices_provider_idx').on(table.provider),
}));
