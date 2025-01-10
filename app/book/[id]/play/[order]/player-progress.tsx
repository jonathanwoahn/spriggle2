'use client';
import { Box, Slider, Typography } from "@mui/material";
import { useState } from "react";

export default function PlayerProgress({ position, setPosition, duration, totalLength, chapterTitle }: { position: number, setPosition: (position: number) => void, duration: number, totalLength: number, chapterTitle: string}) {
  
  function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }
  
  function formatDuration2(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: 2, pb: 2, }}>
      <Typography variant="caption" component="p">{chapterTitle}</Typography>

      <Slider
        aria-label="time-indicator"
        size="small"
        value={position}
        min={0}
        step={1}
        max={duration}
        onChange={(_, value) => setPosition(value as number)}
        sx={(t) => ({
          color: 'rgba(0,0,0,0.87)',
          height: 4,
          '& .MuiSlider-thumb': {
            width: 8,
            height: 8,
            transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
            '&::before': {
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
            },
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0px 0px 0px 8px ${'rgb(0 0 0 / 16%)'}`,
              ...t.applyStyles('dark', {
                boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
              }),
            },
            '&.Mui-active': {
              width: 25,
              height: 25,
            },
          },
          '& .MuiSlider-rail': {
            opacity: 0.28,
          },
          ...t.applyStyles('dark', {
            color: '#fff',
          }),
        })}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', }}>
        {/* how far listened in current chapter */}
        <Typography variant="caption" component="p">{formatDuration(position)}</Typography>
        {/* total amount of time remaining in the audiobook */}
        {/* <Typography variant="caption" component="p">{formatDuration2(totalLength - position)} left</Typography> */}
        {/* total amount of time left in this chapter */}
        <Typography variant="caption" component="p">-{formatDuration(duration - position)}</Typography>
      </Box>
    </Box>

  );
}