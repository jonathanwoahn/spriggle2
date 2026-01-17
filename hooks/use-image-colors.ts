'use client';

import { useState, useEffect } from 'react';
import { Vibrant } from 'node-vibrant/browser';

export interface ImageColors {
  vibrant: string | null;
  muted: string | null;
  darkVibrant: string | null;
  darkMuted: string | null;
  lightVibrant: string | null;
  lightMuted: string | null;
}

const defaultColors: ImageColors = {
  vibrant: null,
  muted: null,
  darkVibrant: null,
  darkMuted: null,
  lightVibrant: null,
  lightMuted: null,
};

export function useImageColors(imageUrl: string | null): { colors: ImageColors; loading: boolean } {
  const [colors, setColors] = useState<ImageColors>(defaultColors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Create an image element to load the image with crossOrigin
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const palette = await Vibrant.from(img).getPalette();

        setColors({
          vibrant: palette.Vibrant?.hex ?? null,
          muted: palette.Muted?.hex ?? null,
          darkVibrant: palette.DarkVibrant?.hex ?? null,
          darkMuted: palette.DarkMuted?.hex ?? null,
          lightVibrant: palette.LightVibrant?.hex ?? null,
          lightMuted: palette.LightMuted?.hex ?? null,
        });
      } catch (error) {
        console.error('Error extracting colors:', error);
        setColors(defaultColors);
      } finally {
        setLoading(false);
      }
    };

    img.onerror = () => {
      console.error('Error loading image for color extraction');
      setColors(defaultColors);
      setLoading(false);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { colors, loading };
}

// Helper to get the best border color from extracted palette
export function getBorderColor(colors: ImageColors): string {
  // Prefer muted colors for borders as they're less jarring
  // Fall back through the palette options
  return (
    colors.muted ||
    colors.darkMuted ||
    colors.lightMuted ||
    colors.vibrant ||
    colors.darkVibrant ||
    colors.lightVibrant ||
    'rgba(0, 0, 0, 0.1)' // Default fallback
  );
}
