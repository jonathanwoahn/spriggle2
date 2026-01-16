import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

// Initialize R2 client (S3-compatible)
const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'spriggle-audio';

/**
 * Upload a file to R2 storage
 */
export async function uploadFile(
  path: string,
  data: Buffer | Uint8Array | Readable,
  contentType: string = 'application/octet-stream'
): Promise<void> {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: path,
    Body: data,
    ContentType: contentType,
  }));
}

/**
 * Download a file from R2 storage as a Buffer
 */
export async function downloadFile(path: string): Promise<Buffer> {
  const response = await R2.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: path,
  }));

  if (!response.Body) {
    throw new Error(`File not found: ${path}`);
  }

  return Buffer.from(await response.Body.transformToByteArray());
}

/**
 * Get a file stream with metadata (for streaming responses)
 */
export async function getFileStream(path: string): Promise<{
  stream: Readable;
  contentLength: number | undefined;
  contentType: string | undefined;
}> {
  const response = await R2.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: path,
  }));

  if (!response.Body) {
    throw new Error(`File not found: ${path}`);
  }

  return {
    stream: response.Body as Readable,
    contentLength: response.ContentLength,
    contentType: response.ContentType,
  };
}

/**
 * Get a file with range support (for audio seeking)
 */
export async function getFileWithRange(
  path: string,
  range?: string
): Promise<{
  stream: Readable;
  contentLength: number | undefined;
  contentType: string | undefined;
  contentRange: string | undefined;
  statusCode: number;
}> {
  const response = await R2.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: path,
    Range: range,
  }));

  if (!response.Body) {
    throw new Error(`File not found: ${path}`);
  }

  return {
    stream: response.Body as Readable,
    contentLength: response.ContentLength,
    contentType: response.ContentType,
    contentRange: response.ContentRange,
    statusCode: range ? 206 : 200,
  };
}

/**
 * List files in a directory/prefix
 */
export async function listFiles(prefix: string): Promise<Array<{
  key: string;
  size: number | undefined;
  lastModified: Date | undefined;
}>> {
  const response = await R2.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  }));

  return (response.Contents || []).map(obj => ({
    key: obj.Key!,
    size: obj.Size,
    lastModified: obj.LastModified,
  }));
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await R2.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: path
    }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(path: string): Promise<void> {
  await R2.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: path,
  }));
}

/**
 * Get file metadata without downloading
 */
export async function getFileMetadata(path: string): Promise<{
  contentLength: number | undefined;
  contentType: string | undefined;
  lastModified: Date | undefined;
} | null> {
  try {
    const response = await R2.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: path,
    }));
    return {
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete multiple files in batch (S3 allows up to 1000 keys per request)
 */
export async function deleteFiles(keys: string[]): Promise<{ deleted: number; errors: string[] }> {
  if (keys.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const MAX_KEYS_PER_REQUEST = 1000;
  let totalDeleted = 0;
  const errors: string[] = [];

  // Process in batches of 1000
  for (let i = 0; i < keys.length; i += MAX_KEYS_PER_REQUEST) {
    const batch = keys.slice(i, i + MAX_KEYS_PER_REQUEST);

    try {
      const response = await R2.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: false,
        },
      }));

      totalDeleted += response.Deleted?.length || 0;

      // Track any errors
      if (response.Errors && response.Errors.length > 0) {
        for (const error of response.Errors) {
          errors.push(`${error.Key}: ${error.Message}`);
        }
      }
    } catch (error) {
      errors.push(`Batch delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { deleted: totalDeleted, errors };
}

/**
 * Delete all files under a prefix (directory)
 */
export async function deleteDirectory(prefix: string): Promise<{ deleted: number; errors: string[] }> {
  // List all files under the prefix
  const files = await listFiles(prefix);

  if (files.length === 0) {
    return { deleted: 0, errors: [] };
  }

  // Delete all files
  const keys = files.map(f => f.key);
  return deleteFiles(keys);
}
