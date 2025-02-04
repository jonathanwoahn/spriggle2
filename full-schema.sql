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

-- Index on jobs table
DROP INDEX IF EXISTS idx_jobs_book_id;
CREATE INDEX idx_jobs_book_id ON jobs((data->>'bookId'));
DROP INDEX IF EXISTS idx_jobs_status;
CREATE INDEX idx_jobs_status ON jobs(status);

-- Index on block_metadata table
DROP INDEX IF EXISTS idx_block_metadata_book_id;
CREATE INDEX idx_block_metadata_book_id ON block_metadata(book_id);
DROP INDEX IF EXISTS idx_block_metadata_block_id;
CREATE INDEX idx_block_metadata_type ON block_metadata(type);

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

-- create a table to hold the legal docs. it should include the following columns: id, title, content, created_at, updated_at

drop table if exists public.legal_docs;
create table public.legal_docs (
  id serial primary key,
  title varchar(255) not null,
  key varchar(255) not null,
  content text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- create a row entry that is the title "About Us", key "about-us", and the text i will paste in

insert into public.legal_docs (title, key, content)
values (
'About Us',
'about-us',
'## What is Spriggle?

Spriggle is more than an audiobook platform—it’s a blueprint for the future of publishing in the AI era. By combining cutting-edge technology with a deep respect for intellectual property, we’ve created a way for publishers to harness the power of AI responsibly while delivering incredible value to families.

Spriggle uses **Cashmere**, our groundbreaking API, to license book content in a way that ensures publishers maintain full control over how their intellectual property is used. From there, Spriggle transforms that content into high-quality, AI-generated audiobooks that families can access at a fraction of the cost of traditional audiobooks.

---

## Why Spriggle?

Spriggle was built to solve a critical challenge in publishing: **How can publishers embrace AI while staying true to their principles of Consent, Compensation, and Credit?**

Here’s how we make it possible:

1. **Consent:** Publishers retain full control over how their content is used, with licensing managed transparently through Cashmere.
2. **Compensation:** Every listen generates revenue for publishers and authors, ensuring fair payment for their work.
3. **Credit:** AI-generated audiobooks give proper acknowledgment to the original creators.

At the same time, Spriggle offers a game-changing benefit for families: **affordable, high-quality audiobooks for children**. By leveraging AI, we eliminate many of the costs associated with traditional audiobook production, making stories more accessible than ever.

---

## How Spriggle Works

1. **Powered by Cashmere**  
   Cashmere licenses book IP and tracks usage so publishers can confidently work with AI while maintaining full control of their content.

2. **AI Narration**  
   Using publisher-provided tools like OpenAI, Spriggle generates engaging, natural-sounding audiobooks from licensed text.

3. **Affordable Access**  
   Families gain access to incredible stories at a fraction of the cost of traditional audiobooks, opening doors to more learning and imagination.

4. **Transparent Reporting**  
   Every interaction is tracked and reported back to Cashmere, ensuring publishers know exactly how their content is being used.

---

## The Bigger Picture

Spriggle isn’t just for us—it’s for **you**. We’ve built this platform as an **open-source project** to empower publishers to launch their own versions of Spriggle. By doing so, publishers can:

- Offer affordable audiobooks to their own audiences.
- Maintain full control over their content and revenue.
- Experiment with AI-powered innovation in a way that’s fully transparent and respectful of their rights.

We’re building Spriggle to prove that AI doesn’t have to be a threat to publishing—it can be the key to unlocking new opportunities for growth and connection.

---

## Join the Movement

Spriggle is our way of showing what’s possible when publishers and technology work together. By solving for the **“3 C’s”** and providing an affordable option for families, we’re creating a **win-win** for everyone.'  
);

INSERT INTO public.legal_docs (title, key, content) VALUES (
  'For Publishers',
  'for-publishers',
  '
# Spriggle: An Open-Source Audiobook Solution for Publishers

Spriggle is an **AI-powered** audiobook platform built to unlock new revenue opportunities for publishers while giving you full control over your content. Designed to showcase the power of AI in creating engaging children’s audiobooks, Spriggle is also a proof of concept for how publishers can leverage tools like **Cashmere** to protect their intellectual property while embracing innovation.

---

## What Is Spriggle?

Spriggle is an audiobook app that generates **high-quality, AI-narrated** versions of licensed children’s books. It allows families to enjoy **affordable, accessible audiobooks** while ensuring publishers and authors are **compensated fairly**.

This platform is **100% transparent**, adhering to principles of **consent, compensation, and credit** for intellectual property owners.

---

## How Does It Work?

Spriggle demonstrates how publishers can build and manage their own audiobook platforms with minimal effort:

1. **Licensing through Cashmere**  
   Cashmere provides publishers with a secure, standards-driven API to license their book IP. This ensures that content usage is authorized and trackable.

2. **AI-Powered Narration**  
   Publishers provide their own OpenAI API key for text-to-speech functionality, enabling seamless audiobook generation with customizable voices.

3. **Subscription-Based Revenue**  
   Use your own Stripe account to manage subscriptions, giving you control over pricing, user data, and payment processing.

4. **Full Control with Supabase**  
   Publishers set up a Supabase account to manage user data and storage, ensuring complete ownership of the backend.

5. **Usage Reporting**  
   Spriggle reports audiobook usage back to Cashmere, so you stay informed about how your content is being consumed.

---

## Why Spriggle?

- **Ownership and Transparency**  
  Spriggle is open source, meaning publishers have full control over the platform’s setup, data, and usage. We provide the tools—you decide how to use them.

- **Unlock AI Opportunities**  
  AI can revolutionize how books are consumed. Spriggle empowers publishers to explore these possibilities without compromising control or quality.

- **Scalable and Cost-Effective**  
  Build your own audiobook platform with minimal investment, using the tools and infrastructure you already trust.

- **Built for Publishers, by Publishers**  
  Spriggle was created to demonstrate what’s possible when publishers embrace AI responsibly.

---

## How to Get Started

1. **Explore the Codebase**  
   Visit the Spriggle GitHub Repository to fork the codebase and customize it for your needs.

2. **Set Up Your Own Instance**  
   Follow our step-by-step documentation to deploy your version of Spriggle on Vercel, set up Supabase, and integrate your own Stripe and OpenAI keys.

3. **Launch Your Audiobook Platform**  
   Offer your customers a seamless, AI-powered audiobook experience that’s entirely under your control.

---

## Join the Movement

Spriggle isn’t just a platform—it’s a movement. Together, we can prove to publishers worldwide that **AI is not a threat but a tool** to help books thrive in the digital age.

**Ready to see what’s possible?** Check out the GitHub Repo and start building your own audiobook platform today.
'
);

INSERT INTO public.legal_docs (title, key, content) VALUES (
  'Privacy Policy',
  'privacy-policy',
  '
# Privacy Policy for Spriggle

**Effective Date: February 4, 2025**

Spriggle ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose information when you use our platform ("Spriggle"), including your rights regarding your information.

---

## 1. Information We Collect

### a. User-Provided Information  
- **Account Information:** When you create an account, we may collect your name, email address, and other details you provide.  
- **Payment Information:** If a publisher integrates Stripe for subscriptions, your payment details are collected and processed by Stripe, not Spriggle.

### b. Usage Information  
- **Audiobook Interactions:** We collect data on audiobook consumption, such as titles accessed, listening progress, and timestamps.  
- **Device Information:** Information about the device you use, including IP address, browser type, and operating system.

### c. Third-Party Integration Data  
- Spriggle interacts with publisher-provided third-party services (e.g., OpenAI for text-to-speech, Stripe for payments, Supabase for user accounts). These services may collect and process data independently.

---

## 2. How We Use Your Information  
- To operate and provide the audiobook platform.  
- To improve Spriggle’s features and user experience.  
- To report audiobook usage back to publishers through the **Cashmere API** in a way that is compliant with licensing agreements.  
- To comply with legal and regulatory requirements.

---

## 3. How Publishers Use Your Information  

Publishers using Spriggle are responsible for managing their user data and ensuring compliance with relevant privacy laws. They may use your data for:  
- Managing subscriptions.  
- Improving their audiobook offerings.  
- Processing payments via Stripe.  

Spriggle does not own or control this data; publishers operate independently.

---

## 4. Data Sharing and Disclosure  

We do not sell or share your personal data with third parties, except:  
- **With Publishers:** Usage data is shared with publishers to fulfill licensing and reporting obligations.  
- **With Service Providers:** We may share data with third-party service providers (e.g., Vercel, Supabase) solely to operate the platform.  
- **For Legal Reasons:** If required to comply with legal obligations or protect our rights.

---

## 5. Your Rights  

Depending on your location, you may have the right to:  
- Access and obtain a copy of your personal data.  
- Request correction or deletion of your data.  
- Opt out of data processing where legally applicable.  

Contact the publisher managing your account for data-related requests.

---

## 6. Data Retention  

Spriggle retains data for as long as necessary to provide the platform or as required by publishers. Publishers are responsible for setting their own data retention policies.

---

## 7. Security  

We prioritize your data security. However, no system is completely secure. If you suspect unauthorized access to your data, notify the publisher managing your account.

---

## 8. Children’s Privacy  

Spriggle is designed for children, but accounts must be managed by a parent or guardian. Personal data is collected minimally and under the control of publishers.

---

## 9. Third-Party Services  

Spriggle relies on third-party services such as **Stripe, OpenAI, and Supabase**. These services have their own privacy policies and are independently responsible for user data.

---

## 10. Open-Source Code and Responsibility  

Spriggle is an **open-source** project. Publishers who deploy their own version are responsible for adhering to this privacy policy and all relevant legal requirements.

---

## 11. Changes to This Policy  

We may update this Privacy Policy to reflect changes in our practices or for legal compliance. The **"Effective Date"** will be updated, and significant changes will be communicated.

---

## 12. Contact Us  

For questions or concerns about this Privacy Policy, contact us at:  

**Email:** [info@cashmerepublishing.com](mailto:info@cashmerepublishing.com)  
'
);

INSERT INTO public.legal_docs (title, key, content) VALUES (
  'Terms of Use',
  'terms-of-use',
  '
# Terms of Use for Spriggle

**Effective Date: February 4, 2025**

Welcome to Spriggle! These **Terms of Use** ("Terms") govern your use of the Spriggle platform ("Platform"). By accessing or using the Platform, you agree to these Terms. If you do not agree, please do not use the Platform.

---

## 1. Definitions

- **Platform**: The Spriggle application that enables access to AI-powered audiobooks for children.  
- **We / Us / Our**: The creators of the Spriggle open-source platform.  
- **Publisher**: Third parties who deploy their own instance of the Platform and manage user accounts, subscriptions, and data.  
- **You / User**: Any individual or parent/guardian accessing the Platform.  

---

## 2. Eligibility

- The Platform is intended for use by children under the supervision of a parent or guardian.  
- Parents or guardians must manage accounts and subscriptions.  

---

## 3. Account Creation

- You may be required to create an account to use the Platform.  
- You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.  

---

## 4. Use of the Platform

- You agree to use the Platform only for lawful purposes and in compliance with these Terms.  
- You may not:  
  - Use the Platform for unauthorized or illegal purposes.  
  - Attempt to reverse-engineer, copy, or modify the Platform’s code or features.  
  - Exploit the Platform to harm or infringe on the rights of others.  

---

## 5. Subscription and Payment

- Subscriptions are managed by publishers using third-party payment processors like **Stripe**. Spriggle does not directly handle payments.  
- Pricing, refunds, and payment disputes are the responsibility of the publisher.  

---

## 6. Content Ownership and Licensing

- The audiobooks available on the Platform are generated using **licensed intellectual property** managed by the publisher.  
- You may not download, copy, distribute, or resell any audiobook or related content.  

---

## 7. AI-Generated Content

- Audiobooks on the Platform are created using AI and may not perfectly represent the original work.  
- You acknowledge that **AI-generated content may contain errors or inaccuracies**, and you use such content at your discretion.  

---

## 8. Data Usage and Privacy

- Your use of the Platform is subject to our **Privacy Policy**.  
- Publishers are independently responsible for how they manage your data.  

---

## 9. Changes to the Platform

- We reserve the right to **update or discontinue** the Platform at any time without prior notice.  

---

## 10. Open-Source Code

- Spriggle is an **open-source** project provided **as is, without warranties**.  
- Publishers deploying their own instance are responsible for compliance with applicable laws.  

---

## 11. Limitation of Liability

Spriggle and its creators are **not liable** for:  

- Errors, interruptions, or unavailability of the Platform.  
- Loss or damage arising from third-party services integrated into the Platform (e.g., **Stripe, OpenAI, Supabase**).  
- Misuse of the Platform by publishers or users.  

---

## 12. Termination

- We reserve the right to **suspend or terminate** access to the Platform for any violation of these Terms.  

---

## 13. Governing Law

- These Terms are governed by the **laws of the United States**.  
- Any disputes will be resolved in the courts of the **United States**.  

---

## 14. Changes to These Terms

- We may modify these Terms from time to time. Continued use of the Platform after changes constitutes **acceptance of the updated Terms**.  

---

## 15. Contact Us

For questions or concerns about these Terms, contact us at:  

**Email:** [info@cashmerepublishing.com](mailto:info@cashmerepublishing.com)  

---

## Notes for Publishers

When publishers deploy their own instance of Spriggle, they are responsible for ensuring that their **Terms of Use align with this document** and comply with local laws.
'
);