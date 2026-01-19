'use client';

import { useEffect, useMemo } from "react";
import { Box, Button, Typography, Chip } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AnimatedBookCover from "@/components/animated-book-cover";
import { useImageColors, ImageColors } from "@/hooks/use-image-colors";
import { useAccentColors } from "@/context/accent-color-context";
import ChaptersButton from "@/app/book/[id]/chapters-button";
import { CoverColors } from "@/lib/extract-colors";

interface BookDetailHeroProps {
  bookId: string;
  title: string;
  creators?: string[];
  duration?: string | null;
  isReady: boolean;
  bookData: any;
  coverColors?: CoverColors | null;
  firstSection?: number;
}

export default function BookDetailHero({
  bookId,
  title,
  creators,
  duration,
  isReady,
  bookData,
  coverColors,
  firstSection = 0,
}: BookDetailHeroProps) {
  // Only use client-side extraction if no pre-fetched colors
  const coverUrl = bookId ? `https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image` : null;
  const { colors: extractedColors, loading } = useImageColors(coverColors ? null : coverUrl);
  const { setColors, resetColors } = useAccentColors();

  // Merge pre-fetched colors with client-extracted colors (prefer pre-fetched)
  const colors = useMemo<ImageColors>(() => {
    if (coverColors) {
      return {
        vibrant: coverColors.vibrant,
        muted: coverColors.muted,
        darkVibrant: coverColors.darkVibrant,
        darkMuted: coverColors.darkMuted,
        lightVibrant: coverColors.lightVibrant,
        lightMuted: coverColors.lightMuted,
      };
    }
    return extractedColors;
  }, [coverColors, extractedColors]);

  // Create dynamic gradient from book colors
  const gradientStart = colors.darkVibrant || colors.vibrant || '#9966FF';
  const gradientEnd = colors.lightMuted || colors.muted || '#FF8866';

  // Determine if colors are ready (either pre-fetched or client-extracted)
  const colorsReady = coverColors || (!loading && (colors.darkVibrant || colors.vibrant));

  // Update navbar colors when book colors are available
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

    // Reset colors when leaving the page
    return () => {
      resetColors();
    };
  }, [colorsReady, colors, setColors, resetColors]);

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        pt: { xs: 10, md: 12 },
        pb: { xs: 6, md: 8 },
        px: 2,
        transition: 'background 0.5s ease',
      }}
    >
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: { xs: 4, md: 6 },
        }}
      >
        {/* Book Cover */}
        <Box sx={{ flexShrink: 0 }}>
          <AnimatedBookCover bookId={bookId} size="large" />
        </Box>

        {/* Book Info */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            textAlign: { xs: 'center', md: 'left' },
            color: 'white',
            flex: 1,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {title}
          </Typography>

          {creators && creators.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <PersonOutlineRoundedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
                {creators.join(', ')}
              </Typography>
            </Box>
          )}

          {duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {duration}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 2,
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Button
              disabled={!isReady}
              startIcon={<PlayArrowRoundedIcon />}
              variant="contained"
              href={`/book/${bookId}/play/${firstSection}`}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'rgba(255,255,255,0.95)',
                color: gradientStart,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: 'white',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.5)',
                  color: 'rgba(0,0,0,0.4)',
                },
              }}
            >
              {isReady ? 'Play Audiobook' : 'Coming Soon'}
            </Button>
            <ChaptersButton
              bookData={bookData}
              primaryColor={gradientStart}
              secondaryColor={gradientEnd}
            />
          </Box>

          {!isReady && (
            <Chip
              label="Audio generation in progress"
              sx={{
                alignSelf: { xs: 'center', md: 'flex-start' },
                mt: 1,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(4px)',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
