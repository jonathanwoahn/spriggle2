/**
 * Migration script: Supabase -> Neon + Cloudflare R2
 *
 * Run with: npx tsx scripts/migrate-from-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Supabase config (old)
const SUPABASE_URL = 'https://tphglcwirtpirtrizojn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaGdsY3dpcnRwaXJ0cml6b2puIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgxNTc0NywiZXhwIjoyMDU0MzkxNzQ3fQ.EkGi6m1_LAQnCr1m73QKnhR8g52V5Irnf6JOGf3zBcE';

// Neon config (new)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uzKmHB4ZLS8M@ep-crimson-breeze-ah4r9u0x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

// R2 config (new)
const R2_ACCOUNT_ID = '47c7fa903e563f7cf160004a5362ac0a';
const R2_ACCESS_KEY_ID = '6b14b53cdf04a23c71fb7d5549aa18c6';
const R2_SECRET_ACCESS_KEY = '26b2b8ff77e118e20c71e530cc250a6bf63eda5a32c1950dba1cedca5e68650d';
const R2_BUCKET = 'spriggle';

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const sql = neon(DATABASE_URL);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function migrateDatabase() {
  console.log('\n📦 Starting database migration...\n');

  // Migrate app_settings
  console.log('Migrating app_settings...');
  const { data: settings, error: settingsError } = await supabase
    .from('app_settings')
    .select('*');

  if (settingsError) {
    console.error('Error fetching app_settings:', settingsError.message);
  } else if (settings && settings.length > 0) {
    for (const setting of settings) {
      try {
        await sql`
          INSERT INTO app_settings (id, key, value, field, description, type, "order")
          VALUES (${setting.id}, ${setting.key}, ${setting.value}, ${setting.field}, ${setting.description}, ${setting.type}, ${setting.order})
          ON CONFLICT (id) DO UPDATE SET
            key = EXCLUDED.key,
            value = EXCLUDED.value,
            field = EXCLUDED.field,
            description = EXCLUDED.description,
            type = EXCLUDED.type,
            "order" = EXCLUDED."order"
        `;
      } catch (e: any) {
        console.error(`  Error inserting setting ${setting.key}:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${settings.length} app_settings`);
  }

  // Migrate collections
  console.log('Migrating collections...');
  const { data: collectionsData, error: collectionsError } = await supabase
    .from('collections')
    .select('*');

  if (collectionsError) {
    console.error('Error fetching collections:', collectionsError.message);
  } else if (collectionsData && collectionsData.length > 0) {
    for (const collection of collectionsData) {
      try {
        await sql`
          INSERT INTO collections (id, name, description, created_at)
          VALUES (${collection.id}, ${collection.name}, ${collection.description}, ${collection.created_at})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description
        `;
      } catch (e: any) {
        console.error(`  Error inserting collection ${collection.name}:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${collectionsData.length} collections`);
  }

  // Migrate collection_books
  console.log('Migrating collection_books...');
  const { data: collectionBooks, error: collectionBooksError } = await supabase
    .from('collection_books')
    .select('*');

  if (collectionBooksError) {
    console.error('Error fetching collection_books:', collectionBooksError.message);
  } else if (collectionBooks && collectionBooks.length > 0) {
    for (const cb of collectionBooks) {
      try {
        await sql`
          INSERT INTO collection_books (id, collection_id, book_id, "order")
          VALUES (${cb.id}, ${cb.collection_id}, ${cb.book_id}, ${cb.order || 0})
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (e: any) {
        console.error(`  Error inserting collection_book:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${collectionBooks.length} collection_books`);
  }

  // Migrate jobs
  console.log('Migrating jobs...');
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*');

  if (jobsError) {
    console.error('Error fetching jobs:', jobsError.message);
  } else if (jobs && jobs.length > 0) {
    for (const job of jobs) {
      try {
        await sql`
          INSERT INTO jobs (id, job_type, status, data, log, dependencies, created_at, updated_at)
          VALUES (${job.id}, ${job.job_type}, ${job.status}, ${JSON.stringify(job.data)}, ${JSON.stringify(job.log || [])}, ${JSON.stringify(job.dependencies || [])}, ${job.created_at}, ${job.updated_at})
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (e: any) {
        console.error(`  Error inserting job ${job.id}:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${jobs.length} jobs`);
  }

  // Migrate block_metadata
  console.log('Migrating block_metadata...');
  const { data: metadata, error: metadataError } = await supabase
    .from('block_metadata')
    .select('*');

  if (metadataError) {
    console.error('Error fetching block_metadata:', metadataError.message);
  } else if (metadata && metadata.length > 0) {
    let count = 0;
    for (const meta of metadata) {
      try {
        // Note: embedding migration would need special handling for vector type
        await sql`
          INSERT INTO block_metadata (id, book_id, block_id, section_order, block_index, type, data, created_at, updated_at)
          VALUES (${meta.id}, ${meta.book_id}, ${meta.block_id}, ${meta.section_order}, ${meta.block_index}, ${meta.type}, ${JSON.stringify(meta.data)}, ${meta.created_at}, ${meta.updated_at})
          ON CONFLICT (id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = EXCLUDED.updated_at
        `;
        count++;
      } catch (e: any) {
        console.error(`  Error inserting block_metadata ${meta.id}:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${count} block_metadata records`);
  }

  // Migrate reporting
  console.log('Migrating reporting...');
  const { data: reports, error: reportsError } = await supabase
    .from('reporting')
    .select('*');

  if (reportsError) {
    console.error('Error fetching reporting:', reportsError.message);
  } else if (reports && reports.length > 0) {
    for (const report of reports) {
      try {
        await sql`
          INSERT INTO reporting (id, block_id, license_type, data, timestamp)
          VALUES (${report.id}, ${report.block_id}, ${report.license_type}, ${JSON.stringify(report.data)}, ${report.reported_at || report.timestamp})
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (e: any) {
        console.error(`  Error inserting report:`, e.message);
      }
    }
    console.log(`  ✓ Migrated ${reports.length} reporting records`);
  }

  console.log('\n✅ Database migration complete!\n');
}

async function migrateStorage() {
  console.log('\n📁 Starting storage migration...\n');

  // List all files in the Supabase 'audio' bucket
  const { data: files, error } = await supabase.storage
    .from('audio')
    .list('', { limit: 1000 });

  if (error) {
    console.error('Error listing files:', error.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log('No files found in Supabase storage');
    return;
  }

  console.log(`Found ${files.length} items in root of audio bucket`);

  // Process each folder (book ID folders)
  for (const item of files) {
    if (item.id === null) {
      // This is a folder, list its contents
      console.log(`\nProcessing folder: ${item.name}`);

      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('audio')
        .list(item.name, { limit: 1000 });

      if (folderError) {
        console.error(`  Error listing folder ${item.name}:`, folderError.message);
        continue;
      }

      if (!folderFiles || folderFiles.length === 0) {
        console.log(`  No files in folder ${item.name}`);
        continue;
      }

      console.log(`  Found ${folderFiles.length} files`);

      for (const file of folderFiles) {
        if (file.id === null) continue; // Skip subfolders

        const filePath = `${item.name}/${file.name}`;

        try {
          // Check if file already exists in R2
          try {
            await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: filePath }));
            console.log(`  ⏭️  Skipping ${filePath} (already exists)`);
            continue;
          } catch (e) {
            // File doesn't exist, proceed with upload
          }

          // Download from Supabase
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('audio')
            .download(filePath);

          if (downloadError) {
            console.error(`  Error downloading ${filePath}:`, downloadError.message);
            continue;
          }

          // Convert to buffer
          const buffer = Buffer.from(await fileData.arrayBuffer());

          // Upload to R2
          await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: filePath,
            Body: buffer,
            ContentType: 'audio/mpeg',
          }));

          console.log(`  ✓ Migrated ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        } catch (e: any) {
          console.error(`  Error migrating ${filePath}:`, e.message);
        }
      }
    }
  }

  console.log('\n✅ Storage migration complete!\n');
}

async function main() {
  console.log('🚀 Starting Supabase -> Neon/R2 Migration\n');
  console.log('='.repeat(50));

  await migrateDatabase();
  await migrateStorage();

  console.log('='.repeat(50));
  console.log('\n🎉 Migration complete!\n');
}

main().catch(console.error);
