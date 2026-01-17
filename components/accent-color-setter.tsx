'use client';

import { useEffect, useMemo, useState } from "react";
import { useImageColors, ImageColors } from "@/hooks/use-image-colors";
import { useAccentColors } from "@/context/accent-color-context";
import { CoverColors } from "@/lib/extract-colors";

interface AccentColorSetterProps {
  bookId: string;
  coverColors?: CoverColors | null;
}

export default function AccentColorSetter({ bookId, coverColors: initialColors }: AccentColorSetterProps) {
  const [fetchedColors, setFetchedColors] = useState<CoverColors | null>(initialColors || null);
  const [apiFetchAttempted, setApiFetchAttempted] = useState(false);

  // Only use client-side extraction if API fetch failed and no colors available
  const coverUrl = bookId && !initialColors && !fetchedColors && apiFetchAttempted
    ? `https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image`
    : null;
  const { colors: extractedColors, loading } = useImageColors(coverUrl);
  const { setColors, resetColors } = useAccentColors();

  // Fetch colors from API if not provided
  useEffect(() => {
    if (!initialColors && !fetchedColors && bookId && !apiFetchAttempted) {
      fetch(`/api/book/${bookId}/extract-colors`)
        .then(res => res.json())
        .then(data => {
          if (data.colors) {
            setFetchedColors(data.colors);
          }
        })
        .catch(() => {
          // Will fall back to client-side extraction
        })
        .finally(() => {
          setApiFetchAttempted(true);
        });
    }
  }, [bookId, initialColors, fetchedColors, apiFetchAttempted]);

  // Merge pre-fetched colors with client-extracted colors
  const colors = useMemo<ImageColors>(() => {
    const dbColors = initialColors || fetchedColors;
    if (dbColors) {
      return {
        vibrant: dbColors.vibrant,
        muted: dbColors.muted,
        darkVibrant: dbColors.darkVibrant,
        darkMuted: dbColors.darkMuted,
        lightVibrant: dbColors.lightVibrant,
        lightMuted: dbColors.lightMuted,
      };
    }
    return extractedColors;
  }, [initialColors, fetchedColors, extractedColors]);

  const colorsReady = initialColors || fetchedColors || (!loading && (colors.darkVibrant || colors.vibrant));

  useEffect(() => {
    if (colorsReady) {
      const primary = colors.darkVibrant || colors.vibrant || 'rgba(153, 102, 255, 0.85)';
      const secondary = colors.muted || colors.darkMuted || 'rgba(122, 82, 204, 0.85)';

      // Add transparency for the navbar
      const primaryWithAlpha = primary?.startsWith('#')
        ? `${primary}d9` // ~85% opacity in hex
        : primary || 'rgba(153, 102, 255, 0.85)';
      const secondaryWithAlpha = secondary?.startsWith('#')
        ? `${secondary}d9`
        : secondary || 'rgba(122, 82, 204, 0.85)';

      setColors({
        primary: primaryWithAlpha,
        secondary: secondaryWithAlpha,
      });
    }

    return () => {
      resetColors();
    };
  }, [colorsReady, colors, setColors, resetColors]);

  // This component doesn't render anything visible
  return null;
}
