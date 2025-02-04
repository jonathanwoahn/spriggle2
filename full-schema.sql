-- type should be an enum that can expand. for now, the values to include are "string" and "boolean". create the enum value as well

DROP TYPE public.app_setting_type;
create type public.app_setting_type as enum ('string', 'boolean');

-- create settings table. settings table should include the following columns: field (display name of the setting), type (app_setting_type), value (can be anything, will be parsed based on the type), description (description of the field), key (key value of the setting in a form), created_at, updated_at. created at should generate automatically when the entry is added, and updated_at should update every time the field value changes 

create table public.app_settings (
  id serial primary key,
  field varchar(255) not null,
  type app_setting_type not null,
  value text not null,
  description text not null,
  key varchar(255) not null,
  order integer not null default 0,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- default populate this table with two entries with the following keys: cashmereApiKey and openAiApiKey. The rest of the values should reflect these keys
insert into public.app_settings (field, type, value, description, key, order)
values
  ('Cashmere API Key', 'string', '', 'API Key for Cashmere', 'cashmereApiKey', 0),
  ('OpenAI API Key', 'string', '', 'API Key for OpenAI', 'openAiApiKey', 1);



-- GENERATE JOBS TABLES
-- need to generate a table to track jobs. it should include the following fields: id (int), created_at (timestamp), updated_at (timestamp), status (enum: 'pending', 'processing', 'completed', 'failed'), type: (enum: 'block', 'section', 'omnibook'), data (jsonb), log (jsonb array), 


-- only drop the job_status if the type already exists
DROP TYPE IF EXISTS public.job_status;
CREATE TYPE public.job_status as enum ('pending', 'processing', 'completed', 'failed', 'waiting');

DROP TYPE IF EXISTS public.job_type;
CREATE TYPE public.job_type as enum ('create-jobs', 'convert-to-audio', 'section-concat-meta', 'book-meta', 'book-summary', 'summary-embedding');

DROP TABLE IF EXISTS public.jobs;
CREATE TABLE public.jobs (
  id uuid primary key default gen_random_uuid(),
  status job_status not null,
  job_type job_type not null,
  data jsonb not null,
  log jsonb[] not null,
  children uuid[] DEFAULT '{}',
  dependencies text[] DEFAULT '{}', -- Changed from uuid[] to text[]
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- Drop the index if it already exists
DROP INDEX IF EXISTS unique_book_block_omnibook;

-- Create a unique index on the bookBlockId, omnibookId properties within the data JSONB column, and job_type
create unique index unique_book_block_omnibook on public.jobs (
  job_type,
  (data->>'blockId'),
  (data->>'bookId')
);

-- this is just a temporary solution. we'll come back to this later once everyting else is working
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;



-- create a "collections" table. it should have an id, collection name and description. 

create table public.collections (
  id serial primary key,
  name varchar(255) not null,
  description text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- I need a table that connects collections to bookId's. This table should have an id, collection_id, book_id, and created_at. It should connect to the collections table, but the book_id's are an external id
drop table if exists public.collection_books;
create table public.collection_books (
  id serial primary key,
  collection_id integer references public.collections(id) not null,
  book_id varchar(32) not null,
  created_at timestamp not null default now(),
  unique (collection_id, book_id)
);

-- build a table that holds audio file metadata. it should include things like book_id, block_id, duration, start_time, section order number, and sequence number

-- make an enum of 'text', 'section' and 'book' for the type column.






DROP TYPE IF EXISTS public.block_metadata_type;
CREATE TYPE public.block_metadata_type as enum ('text', 'section', 'book');
CREATE EXTENSION IF NOT EXISTS vector;


drop table if exists public.block_metadata;
create table public.block_metadata (
  id serial primary key,
  book_id varchar(32) not null,
  block_id varchar(32) not null,
  section_order integer,
  block_index integer not null,
  type block_metadata_type not null,
  data jsonb not null,
  embedding vector(1536),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  unique (book_id, block_id)
);

create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table(id integer, book_id varchar, block_id varchar, data jsonb, section_order integer, block_index integer, type public.block_metadata_type, similarity float)
language sql
as $$
  select 
    bm.id,
    bm.book_id,
    bm.block_id,
    bm.data,
    bm.section_order,
    bm.block_index,
    bm.type,
    (1 - (bm.embedding <=> query_embedding))::float as similarity
  from block_metadata bm
  where bm.embedding <=> query_embedding < 1 - match_threshold
  order by bm.embedding <=> query_embedding asc
  limit least(match_count, 200);
$$;





-- ********** REPORTING ***********
-- create a table to hold the reporting data. it should include the following columns: id, block_id, transactionId, api_key, license_type, reported_at, used_at, data (jsonb)

drop table if exists public.reporting;
create table public.reporting (
  id uuid primary key default gen_random_uuid(),
  block_id varchar(32) not null,
  transaction_id varchar(32) not null,
  api_key varchar(255) not null,
  license_type varchar(255) not null,
  reported_at timestamp not null default now(),
  used_at timestamp not null default now(),
  data jsonb
);

