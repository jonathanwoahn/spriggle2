import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/flying_books.png');
const outputDir = join(__dirname, '../public/hero');

// Book extraction regions - tighter crops focused on the books
const books = [
  { name: 'book-1', x: 150, y: 540, width: 300, height: 220 },  // Large bottom center book
  { name: 'book-2', x: 560, y: 140, width: 170, height: 140 },  // Upper right book
  { name: 'book-3', x: 95, y: 200, width: 160, height: 130 },   // Upper left book
  { name: 'book-4', x: 600, y: 340, width: 160, height: 140 },  // Right middle book
  { name: 'book-5', x: 360, y: 100, width: 130, height: 110 },  // Top center small book
];

// Check if a pixel is part of the background (pinkish/purplish/orangish gradient)
function isBackgroundColor(r, g, b) {
  // The background is a pink-purple-orange gradient
  // Books are cream/beige/white colored (high R, medium-high G, lower B or similar across channels)

  // Calculate relative differences
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

  // Background colors tend to be more saturated (pinkish, purplish, orangish)
  // Book pages are more neutral/cream (low saturation, high brightness)

  // Check if it's a warm background color (pink/purple/orange)
  const isPinkish = r > 180 && g < 200 && b > 150 && r > g;
  const isPurplish = r > 140 && g < 160 && b > 180;
  const isOrangish = r > 200 && g > 120 && g < 180 && b < 150;
  const isWarmPink = r > 220 && g > 180 && b > 200 && r > b;

  // Light cloudy areas
  const isLightPink = r > 240 && g > 220 && b > 220 && (r - b) > 10;

  // If it's clearly a background gradient color
  if (isPinkish || isPurplish || isOrangish || isWarmPink || isLightPink) {
    return true;
  }

  // Very light near-white areas that are part of the sky
  // These tend to have a slight pink/warm tint
  if (r > 245 && g > 235 && b > 230 && (r - b) > 5) {
    return true;
  }

  return false;
}

async function extractBooksWithTransparency() {
  await mkdir(outputDir, { recursive: true });

  console.log('Extracting books with transparent backgrounds...');

  for (const book of books) {
    const outputPath = join(outputDir, `${book.name}.png`);

    try {
      // First extract the region
      const extracted = await sharp(inputPath)
        .extract({ left: book.x, top: book.y, width: book.width, height: book.height })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = extracted;
      const { width, height, channels } = info;

      // Create new buffer with alpha channel
      const newData = Buffer.alloc(width * height * 4);

      for (let i = 0; i < width * height; i++) {
        const srcIdx = i * channels;
        const dstIdx = i * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        newData[dstIdx] = r;
        newData[dstIdx + 1] = g;
        newData[dstIdx + 2] = b;

        // Set alpha based on whether it's background
        if (isBackgroundColor(r, g, b)) {
          newData[dstIdx + 3] = 0; // Transparent
        } else {
          newData[dstIdx + 3] = 255; // Opaque
        }
      }

      // Apply some edge softening by checking neighbors
      const softened = Buffer.from(newData);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          const alpha = newData[idx + 3];

          if (alpha === 255) {
            // Count transparent neighbors
            let transparentNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                if (newData[neighborIdx + 3] === 0) transparentNeighbors++;
              }
            }
            // Soften edges
            if (transparentNeighbors >= 3) {
              softened[idx + 3] = Math.round(255 * (1 - transparentNeighbors / 8));
            }
          }
        }
      }

      await sharp(softened, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(outputPath);

      console.log(`✓ Extracted ${book.name}.png with transparency`);
    } catch (err) {
      console.error(`✗ Failed to extract ${book.name}:`, err.message);
    }
  }

  console.log('\nDone! Check public/hero/ for extracted images.');
}

extractBooksWithTransparency();
