import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/flying_books.png');
const outputDir = join(__dirname, '../public/hero');

// Book extraction regions (x, y, width, height) based on 800x800 image
// Each book has slightly different positioning
const books = [
  { name: 'book-1', x: 130, y: 520, width: 340, height: 260 },  // Large bottom center book
  { name: 'book-2', x: 540, y: 120, width: 200, height: 180 },  // Upper right book
  { name: 'book-3', x: 80, y: 180, width: 180, height: 160 },   // Upper left book
  { name: 'book-4', x: 580, y: 320, width: 180, height: 160 },  // Right middle book
  { name: 'book-5', x: 340, y: 80, width: 160, height: 140 },   // Top center small book
];

async function extractBooks() {
  await mkdir(outputDir, { recursive: true });

  console.log('Extracting books from flying_books.png...');

  for (const book of books) {
    const outputPath = join(outputDir, `${book.name}.png`);

    try {
      await sharp(inputPath)
        .extract({ left: book.x, top: book.y, width: book.width, height: book.height })
        .png()
        .toFile(outputPath);

      console.log(`✓ Extracted ${book.name}.png`);
    } catch (err) {
      console.error(`✗ Failed to extract ${book.name}:`, err.message);
    }
  }

  console.log('\nDone! Check public/hero/ for extracted images.');
}

extractBooks();
