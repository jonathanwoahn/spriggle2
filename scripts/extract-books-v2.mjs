import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/flying_books.png');
const outputDir = join(__dirname, '../public/hero');

// Tighter book extraction regions
const books = [
  { name: 'book-1', x: 160, y: 550, width: 280, height: 200 },  // Large bottom book
  { name: 'book-2', x: 565, y: 145, width: 160, height: 125 },  // Upper right book
  { name: 'book-3', x: 100, y: 210, width: 145, height: 115 },  // Upper left book
  { name: 'book-4', x: 605, y: 350, width: 145, height: 125 },  // Right middle book
  { name: 'book-5', x: 365, y: 105, width: 120, height: 100 },  // Top center book
];

// Check if pixel is a book color (cream, beige, tan, white pages)
function isBookColor(r, g, b) {
  // Convert to HSL for better color analysis
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;

  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    if (max === rNorm) {
      h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / d + 2) / 6;
    } else {
      h = ((rNorm - gNorm) / d + 4) / 6;
    }
  }

  const hDeg = h * 360;

  // Book pages are:
  // - Light (high lightness): cream, white, off-white
  // - Low to medium saturation
  // - Hue in warm range (yellows, oranges, browns) or neutral

  // Cream/beige book pages: high lightness, low saturation, warm hue
  const isCream = l > 0.75 && s < 0.35 && (hDeg < 60 || hDeg > 340);

  // Tan/brown book edges and spine
  const isTan = l > 0.5 && l < 0.85 && s < 0.5 && hDeg > 15 && hDeg < 50;

  // Pure white/off-white pages
  const isWhitish = l > 0.9 && s < 0.15;

  // Darker brown for book spine/edges
  const isBrown = l > 0.35 && l < 0.7 && s < 0.6 && hDeg > 10 && hDeg < 45;

  // Golden sparkle colors (keep these too)
  const isGolden = l > 0.6 && s > 0.4 && hDeg > 35 && hDeg < 55;

  return isCream || isTan || isWhitish || isBrown || isGolden;
}

async function extractBooks() {
  await mkdir(outputDir, { recursive: true });
  console.log('Extracting books with better transparency...');

  for (const book of books) {
    const outputPath = join(outputDir, `${book.name}.png`);

    try {
      const extracted = await sharp(inputPath)
        .extract({ left: book.x, top: book.y, width: book.width, height: book.height })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = extracted;
      const { width, height, channels } = info;

      // Create alpha channel buffer
      const alphaData = Buffer.alloc(width * height * 4);

      // First pass: determine alpha based on color
      for (let i = 0; i < width * height; i++) {
        const srcIdx = i * channels;
        const dstIdx = i * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        alphaData[dstIdx] = r;
        alphaData[dstIdx + 1] = g;
        alphaData[dstIdx + 2] = b;
        alphaData[dstIdx + 3] = isBookColor(r, g, b) ? 255 : 0;
      }

      // Second pass: dilate the book region to fill small holes
      const dilated = Buffer.from(alphaData);
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            if (alphaData[idx + 3] === 0) {
              // Check if surrounded by opaque pixels
              let opaqueNeighbors = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nIdx = ((y + dy) * width + (x + dx)) * 4;
                  if (alphaData[nIdx + 3] > 0) opaqueNeighbors++;
                }
              }
              // Fill holes that are mostly surrounded
              if (opaqueNeighbors >= 5) {
                dilated[idx + 3] = 200;
              }
            }
          }
        }
      }

      // Third pass: soften edges
      const final = Buffer.from(dilated);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          if (dilated[idx + 3] > 0) {
            let transparentNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nIdx = ((y + dy) * width + (x + dx)) * 4;
                if (dilated[nIdx + 3] === 0) transparentNeighbors++;
              }
            }
            if (transparentNeighbors >= 2) {
              final[idx + 3] = Math.round(dilated[idx + 3] * (1 - transparentNeighbors / 12));
            }
          }
        }
      }

      await sharp(final, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(outputPath);

      console.log(`✓ Extracted ${book.name}.png`);
    } catch (err) {
      console.error(`✗ Failed: ${book.name}:`, err.message);
    }
  }

  console.log('\nDone!');
}

extractBooks();
