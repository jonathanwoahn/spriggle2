'use client';

import { Box, ButtonBase, Typography, keyframes } from "@mui/material";
import BookCoverImage from "./book-cover-image";
import { IOmnipub } from "@/lib/types";
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

export default function CarouselCard({ book }: { book: IOmnipub }) {
  const { uuid, title, creators } = book;
  const creatorStr = Array.isArray(creators) ? creators.join(', ') : '';

  // Extract colors from book cover
  const coverUrl = uuid ? `https://omnibk.ai/api/v2/omnipub/${uuid}/cover_image` : null;
  const { colors } = useImageColors(coverUrl);

  // Use a golden/amber accent for the border - contrasts well with most covers
  // Blend with the book's vibrant color for uniqueness
  const accentColor = '#D4A574'; // Warm golden base
  const vibrantColor = colors.vibrant || colors.darkVibrant || accentColor;
  const highlightColor = colors.lightVibrant || '#FFE4B5';

  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
      <ButtonBase
        href={"/book/" + uuid}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '200px',
          ml: 'auto',
          mr: 'auto',
          p: 2,
          gap: 2,
        }}>
        {/* Animated border wrapper */}
        <Box
          sx={{
            position: 'relative',
            padding: '4px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${vibrantColor} 100%)`,
            boxShadow: `0 4px 16px ${vibrantColor}40`,
            transition: 'box-shadow 0.3s ease, transform 0.2s ease',
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
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 20px ${vibrantColor}50`,
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
              borderRadius: '8px',
              overflow: 'hidden',
              lineHeight: 0,
              padding: '2px',
              background: 'rgba(255,255,255,0.9)',
            }}
          >
            <Box
              sx={{
                borderRadius: '6px',
                overflow: 'hidden',
                lineHeight: 0,
              }}
            >
              <BookCoverImage bookId={uuid} height={200} noBorderRadius />
            </Box>
          </Box>
        </Box>
        <Box
          component="div"
          sx={{
            display: 'block',
            width: '160px',
          }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}>{title}</Typography>
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{creatorStr}</Typography>
        </Box>
      </ButtonBase>

    </Box>
  );
}