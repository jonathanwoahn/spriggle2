import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/flying_books.png');
const outputDir = join(__dirname, '../public/hero');

// Image is 800x800
// Very tight book extraction regions - just the books, minimal background
const books = [
  // Book 1: Large open book at bottom center - the prominent one
  { name: 'book-1', x: 145, y: 530, width: 310, height: 240 },

  // Book 2: Upper right book - tilted, medium size
  { name: 'book-2', x: 545, y: 130, width: 190, height: 165 },

  // Book 3: Upper left small book
  { name: 'book-3', x: 75, y: 185, width: 175, height: 155 },

  // Book 4: Right side middle book
  { name: 'book-4', x: 585, y: 330, width: 175, height: 155 },

  // Book 5: Top center small book
  { name: 'book-5', x: 340, y: 85, width: 155, height: 135 },
];

async function extractBooks() {
  await mkdir(outputDir, { recursive: true });
  console.log('Extracting books (preserving watercolor edges)...\n');

  for (const book of books) {
    const outputPath = join(outputDir, `${book.name}.png`);

    try {
      await sharp(inputPath)
        .extract({
          left: book.x,
          top: book.y,
          width: book.width,
          height: book.height
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ ${book.name}.png (${book.width}x${book.height})`);
    } catch (err) {
      console.error(`✗ ${book.name}: ${err.message}`);
    }
  }

  console.log('\nDone! Images saved to public/hero/');
}

extractBooks();
