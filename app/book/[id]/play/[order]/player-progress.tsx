'use client';
import { formatDuration } from "@/lib/utils";
import { Box, Slider, Typography } from "@mui/material";
import { useEffect } from 'react';

export default function PlayerProgress({
  position,
  setPosition,
  duration,
  onSeekEnd,
  onSeekStart,
  primaryColor = '#9966FF',
}: {
  position: number,
  setPosition: (position: number) => void,
  duration: number,
  onSeekEnd: () => void,
  onSeekStart: () => void,
  primaryColor?: string,
}) {

  useEffect(() => {
    const handleMouseUp = () => {
      onSeekEnd();
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };

  }, [onSeekEnd])

  // Create a lighter version of the primary color for the gradient
  const lighterColor = `${primaryColor}99`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Slider
        aria-label="time-indicator"
        size="small"
        value={position}
        min={0}
        step={1}
        max={duration || 0}
        onChange={(_, value) => setPosition(value as number)}
        onMouseDown={onSeekStart}
        onMouseUp={onSeekEnd}
        onTouchStart={onSeekStart}
        onTouchEnd={onSeekEnd}
        sx={{
          color: primaryColor,
          height: 4,
          '& .MuiSlider-track': {
            background: `linear-gradient(90deg, ${primaryColor} 0%, ${lighterColor} 100%)`,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            backgroundColor: '#fff',
            border: `2px solid ${primaryColor}`,
            transition: '0.2s cubic-bezier(.47,1.64,.41,.8)',
            '&::before': {
              boxShadow: `0 2px 12px 0 ${primaryColor}60`,
            },
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0px 0px 0px 8px ${primaryColor}25`,
            },
            '&.Mui-active': {
              width: 20,
              height: 20,
            },
          },
          '& .MuiSlider-rail': {
            opacity: 0.2,
            backgroundColor: primaryColor,
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          mt: -0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
        >
          {formatDuration(position)}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
        >
          -{formatDuration(duration - position)}
        </Typography>
      </Box>
    </Box>
  );
}
