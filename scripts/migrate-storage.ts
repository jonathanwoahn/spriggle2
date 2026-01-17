/**
 * Storage migration: Supabase -> Cloudflare R2
 * Run with: npx tsx scripts/migrate-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const SUPABASE_URL = 'https://tphglcwirtpirtrizojn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaGdsY3dpcnRwaXJ0cml6b2puIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgxNTc0NywiZXhwIjoyMDU0MzkxNzQ3fQ.EkGi6m1_LAQnCr1m73QKnhR8g52V5Irnf6JOGf3zBcE';

const R2_ACCOUNT_ID = '47c7fa903e563f7cf160004a5362ac0a';
const R2_ACCESS_KEY_ID = '6b14b53cdf04a23c71fb7d5549aa18c6';
const R2_SECRET_ACCESS_KEY = '26b2b8ff77e118e20c71e530cc250a6bf63eda5a32c1950dba1cedca5e68650d';
const R2_BUCKET = 'spriggle';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function migrateFolder(folderName: string) {
  console.log(`\nProcessing folder: ${folderName}`);

  // Paginate through all files in the folder
  let allFiles: Array<{ id: string | null; name: string }> = [];
  let offset = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data: files, error } = await supabase.storage
      .from('audio')
      .list(folderName, { limit: PAGE_SIZE, offset });

    if (error) {
      console.error(`  Error listing folder: ${error.message}`);
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    if (!files || files.length === 0) {
      break;
    }

    allFiles = allFiles.concat(files);

    if (files.length < PAGE_SIZE) {
      break; // No more pages
    }
    offset += PAGE_SIZE;
  }

  if (allFiles.length === 0) {
    console.log(`  No files found`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  console.log(`  Found ${allFiles.length} files`);

  let migrated = 0, skipped = 0, errors = 0;

  for (const file of allFiles) {
    if (file.id === null) continue; // Skip subfolders

    const filePath = `${folderName}/${file.name}`;

    try {
      // Check if already in R2
      if (await fileExistsInR2(filePath)) {
        skipped++;
        continue;
      }

      // Download from Supabase
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('audio')
        .download(filePath);

      if (downloadError) {
        console.error(`  ✗ ${file.name}: ${downloadError.message}`);
        errors++;
        continue;
      }

      // Upload to R2
      const buffer = Buffer.from(await fileData.arrayBuffer());
      await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: filePath,
        Body: buffer,
        ContentType: 'audio/mpeg',
      }));

      migrated++;
      console.log(`  ✓ ${file.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (e: any) {
      console.error(`  ✗ ${file.name}: ${e.message}`);
      errors++;
    }
  }

  return { migrated, skipped, errors };
}

async function main() {
  console.log('📁 Starting Storage Migration: Supabase -> R2\n');

  // List root folders (book IDs)
  const { data: items, error } = await supabase.storage
    .from('audio')
    .list('', { limit: 1000 });

  if (error) {
    console.error('Error listing bucket:', error.message);
    return;
  }

  if (!items || items.length === 0) {
    console.log('No items found in bucket');
    return;
  }

  const folders = items.filter(item => item.id === null);
  console.log(`Found ${folders.length} folders to migrate\n`);

  let totalMigrated = 0, totalSkipped = 0, totalErrors = 0;

  for (const folder of folders) {
    const result = await migrateFolder(folder.name);
    totalMigrated += result.migrated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Storage migration complete!`);
  console.log(`   Migrated: ${totalMigrated} files`);
  console.log(`   Skipped (already exist): ${totalSkipped} files`);
  console.log(`   Errors: ${totalErrors} files\n`);
}

main().catch(console.error);
