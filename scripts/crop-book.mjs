import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/book.png');
const outputPath = join(__dirname, '../public/book.png');

// Image is 1024x1024, crop from left to remove artifact
async function cropBook() {
  console.log('Cropping left edge artifact from book.png...');

  // Read original, crop 30px from left side
  const cropped = await sharp(inputPath)
    .extract({
      left: 30,      // Remove 30px from left
      top: 0,
      width: 1024 - 30,  // New width
      height: 1024
    })
    .toBuffer();

  // Write back
  await sharp(cropped)
    .png()
    .toFile(outputPath);

  console.log('✓ Cropped book.png (removed 30px from left edge)');
}

cropBook();
