'use client';

import { Box, Button, Typography, Chip } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AnimatedBookCover from "@/components/animated-book-cover";
import ChaptersButton from "@/app/book/[id]/chapters-button";

// Default colors (purple brand)
const DEFAULT_GRADIENT_START = '#9966FF';
const DEFAULT_GRADIENT_END = '#FF8866';

interface BookDetailHeroProps {
  bookId: string;
  title: string;
  creators?: string[];
  duration?: string | null;
  isReady: boolean;
  bookData: any;
  firstSection?: number;
}

export default function BookDetailHero({
  bookId,
  title,
  creators,
  duration,
  isReady,
  bookData,
  firstSection = 0,
}: BookDetailHeroProps) {
  // CSS variable values for passing to child components
  const gradientStart = `var(--cover-dark-vibrant, var(--cover-vibrant, ${DEFAULT_GRADIENT_START}))`;
  const gradientEnd = `var(--cover-light-muted, var(--cover-muted, ${DEFAULT_GRADIENT_END}))`;

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
