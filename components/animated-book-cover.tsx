'use client';

import { Box, keyframes } from "@mui/material";
import BookCoverImage from "./book-cover-image";
import { useImageColors } from "@/hooks/use-image-colors";

// Slow rotating shine animation
const shimmer = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

interface AnimatedBookCoverProps {
  bookId: string;
  height?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function AnimatedBookCover({ bookId, height, size = 'medium' }: AnimatedBookCoverProps) {
  const coverUrl = bookId ? `https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image` : null;
  const { colors } = useImageColors(coverUrl);

  // Use a golden/amber accent for the border - contrasts well with most covers
  const accentColor = '#D4A574';
  const vibrantColor = colors.vibrant || colors.darkVibrant || accentColor;
  const highlightColor = colors.lightVibrant || '#FFE4B5';

  // Size configurations
  const sizeConfig = {
    small: { height: 150, padding: '3px', borderRadius: '10px', innerRadius: '7px' },
    medium: { height: 200, padding: '4px', borderRadius: '12px', innerRadius: '8px' },
    large: { height: 320, padding: '5px', borderRadius: '14px', innerRadius: '10px' },
  };

  const config = sizeConfig[size];
  const coverHeight = height || config.height;

  return (
    <Box
      sx={{
        position: 'relative',
        padding: config.padding,
        borderRadius: config.borderRadius,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accentColor} 0%, ${vibrantColor} 100%)`,
        boxShadow: `0 8px 32px ${vibrantColor}50`,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 45deg,
            ${highlightColor} 90deg,
            #fff 100deg,
            ${highlightColor} 110deg,
            transparent 155deg,
            transparent 360deg
          )`,
          animation: `${shimmer} 6s linear infinite`,
          opacity: 0.7,
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${vibrantColor}60`,
        },
        '&:hover::before': {
          opacity: 1,
          animationDuration: '3s',
        },
      }}
    >
      {/* White inner border */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: config.innerRadius,
          overflow: 'hidden',
          lineHeight: 0,
          padding: '2px',
          background: 'rgba(255,255,255,0.9)',
        }}
      >
        <Box
          sx={{
            borderRadius: `calc(${config.innerRadius} - 2px)`,
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <BookCoverImage bookId={bookId} height={coverHeight} noBorderRadius />
        </Box>
      </Box>
    </Box>
  );
}
