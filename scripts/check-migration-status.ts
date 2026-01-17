/**
 * Check migration status: Compare Supabase vs Neon
 * Run with: npx tsx scripts/check-migration-status.ts
 */

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const SUPABASE_URL = 'https://tphglcwirtpirtrizojn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaGdsY3dpcnRwaXJ0cml6b2puIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgxNTc0NywiZXhwIjoyMDU0MzkxNzQ3fQ.EkGi6m1_LAQnCr1m73QKnhR8g52V5Irnf6JOGf3zBcE';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uzKmHB4ZLS8M@ep-crimson-breeze-ah4r9u0x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const R2_ACCOUNT_ID = '47c7fa903e563f7cf160004a5362ac0a';
const R2_ACCESS_KEY_ID = '6b14b53cdf04a23c71fb7d5549aa18c6';
const R2_SECRET_ACCESS_KEY = '26b2b8ff77e118e20c71e530cc250a6bf63eda5a32c1950dba1cedca5e68650d';
const R2_BUCKET = 'spriggle';

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

async function checkStatus() {
  console.log('\n📊 Migration Status Check\n');
  console.log('='.repeat(60));

  const tables = [
    'app_settings',
    'collections',
    'collection_books',
    'jobs',
    'block_metadata',
    'reporting'
  ];

  console.log('\n📦 DATABASE COMPARISON\n');
  console.log('Table'.padEnd(20) + 'Supabase'.padEnd(12) + 'Neon'.padEnd(12) + 'Status');
  console.log('-'.repeat(60));

  // Query each table separately for Neon (can't interpolate table names)
  const neonCounts: Record<string, number> = {};
  try {
    const [settings, collections, collBooks, jobs, metadata, reporting] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM app_settings`,
      sql`SELECT COUNT(*) as count FROM collections`,
      sql`SELECT COUNT(*) as count FROM collection_books`,
      sql`SELECT COUNT(*) as count FROM jobs`,
      sql`SELECT COUNT(*) as count FROM block_metadata`,
      sql`SELECT COUNT(*) as count FROM reporting`,
    ]);
    neonCounts['app_settings'] = parseInt(settings[0]?.count || '0');
    neonCounts['collections'] = parseInt(collections[0]?.count || '0');
    neonCounts['collection_books'] = parseInt(collBooks[0]?.count || '0');
    neonCounts['jobs'] = parseInt(jobs[0]?.count || '0');
    neonCounts['block_metadata'] = parseInt(metadata[0]?.count || '0');
    neonCounts['reporting'] = parseInt(reporting[0]?.count || '0');
  } catch (e: any) {
    console.log('Error querying Neon:', e.message);
  }

  for (const table of tables) {
    try {
      // Count in Supabase
      const { count: supabaseCount, error: supabaseError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      // Get Neon count from pre-fetched results
      const neonCount = neonCounts[table] ?? -1;

      const sbCount = supabaseError ? 'Error' : (supabaseCount || 0).toString();
      const status = supabaseError
        ? '❓'
        : (supabaseCount === neonCount ? '✅' : '⚠️ Mismatch');

      console.log(
        table.padEnd(20) +
        sbCount.toString().padEnd(12) +
        neonCount.toString().padEnd(12) +
        status
      );
    } catch (e: any) {
      console.log(table.padEnd(20) + '?'.padEnd(12) + 'Error'.padEnd(12) + '❌ ' + e.message.slice(0, 20));
    }
  }

  // Check storage
  console.log('\n📁 STORAGE COMPARISON (Supabase vs R2)\n');
  console.log('Folder'.padEnd(36) + 'Supabase'.padEnd(12) + 'R2'.padEnd(12) + 'Status');
  console.log('-'.repeat(72));

  try {
    const { data: items, error } = await supabase.storage
      .from('audio')
      .list('', { limit: 1000 });

    if (error) {
      console.log(`Supabase storage error: ${error.message}`);
    } else {
      const folders = items?.filter(item => item.id === null) || [];

      for (const folder of folders) {
        // Count in Supabase
        const { data: sbFiles } = await supabase.storage
          .from('audio')
          .list(folder.name, { limit: 10000 });
        const sbCount = sbFiles?.filter(f => f.id !== null).length || 0;

        // Count in R2
        let r2Count = 0;
        let continuationToken: string | undefined;
        do {
          const r2Response = await r2.send(new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: `${folder.name}/`,
            ContinuationToken: continuationToken,
          }));
          r2Count += r2Response.Contents?.length || 0;
          continuationToken = r2Response.NextContinuationToken;
        } while (continuationToken);

        const status = sbCount === r2Count ? '✅' : (r2Count === 0 ? '❌ Not migrated' : `⚠️ Partial (${r2Count}/${sbCount})`);
        console.log(
          folder.name.slice(0, 34).padEnd(36) +
          sbCount.toString().padEnd(12) +
          r2Count.toString().padEnd(12) +
          status
        );
      }
    }
  } catch (e: any) {
    console.log(`Storage check error: ${e.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Status check complete!\n');
}

checkStatus().catch(console.error);
