import { Vibrant } from 'node-vibrant/node';

export interface CoverColors {
  vibrant: string | null;
  muted: string | null;
  darkVibrant: string | null;
  darkMuted: string | null;
  lightVibrant: string | null;
  lightMuted: string | null;
  // Computed colors for UI
  primary: string;
  secondary: string;
}

/**
 * Extract colors from a book cover image URL
 * Works on the server-side using node-vibrant
 */
export async function extractColorsFromUrl(imageUrl: string): Promise<CoverColors> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    const colors: CoverColors = {
      vibrant: palette.Vibrant?.hex || null,
      muted: palette.Muted?.hex || null,
      darkVibrant: palette.DarkVibrant?.hex || null,
      darkMuted: palette.DarkMuted?.hex || null,
      lightVibrant: palette.LightVibrant?.hex || null,
      lightMuted: palette.LightMuted?.hex || null,
      // Compute primary/secondary for navbar and UI elements
      primary: palette.DarkVibrant?.hex || palette.Vibrant?.hex || '#9966FF',
      secondary: palette.Muted?.hex || palette.DarkMuted?.hex || '#7A52CC',
    };

    return colors;
  } catch (error) {
    console.error('Failed to extract colors from image:', error);
    // Return default brand colors on failure
    return {
      vibrant: null,
      muted: null,
      darkVibrant: null,
      darkMuted: null,
      lightVibrant: null,
      lightMuted: null,
      primary: '#9966FF',
      secondary: '#7A52CC',
    };
  }
}

/**
 * Extract colors from a book ID by constructing the cover image URL
 */
export async function extractColorsForBook(bookId: string): Promise<CoverColors> {
  const coverUrl = `https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image`;
  return extractColorsFromUrl(coverUrl);
}

/**
 * Add alpha transparency to a hex color
 * @param hex - Hex color string (e.g., "#9966FF")
 * @param alpha - Alpha value 0-1 (e.g., 0.85)
 * @returns Hex color with alpha (e.g., "#9966FFd9")
 */
export function addAlphaToHex(hex: string, alpha: number): string {
  // Convert alpha (0-1) to hex (00-FF)
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${alphaHex}`;
}
