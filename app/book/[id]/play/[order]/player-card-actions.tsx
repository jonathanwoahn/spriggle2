'use client';

import ListIcon from '@mui/icons-material/List';
import SpeedIcon from '@mui/icons-material/Speed';
import { Button, CardActions } from '@mui/material';
import { useState } from 'react';
import ChapterDrawer from '../../chapter-drawer';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import RepeatIcon from '@mui/icons-material/Repeat';
import { IBookData } from '@/lib/types';

export const SPEEDS = [
  {
    value: 0.5,
    label: '0.5x',
  },
  {
    value: 1.0,
    label: '1.0x',
  },
  {
    value: 1.5,
    label: '1.5x',
  },
  {
    value: 2.0,
    label: '2.0x',
  },
];


export default function PlayerCardActions({
  bookData,
  autoplay,
  setAutoplay,
  speed,
  setSpeed,
}: {
  bookData: IBookData,
  autoplay: boolean,
  setAutoplay: (autoplay: boolean) => void
  speed: {value: number, label: string},
  setSpeed: (speed: {value: number, label: string}) => void
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSpeedChange = () => {
    const currentIndex = SPEEDS.findIndex((s) => s.value === speed?.value);
    const nextIndex = currentIndex === SPEEDS.length - 1 ? 0 : currentIndex + 1;
    setSpeed(SPEEDS[nextIndex]);
  }
  
  return (
    <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <Button
        onClick={handleSpeedChange}
        startIcon={<SpeedIcon />}>
        {speed?.label}
      </Button>
      <Button
        onClick={() => setAutoplay(!autoplay)}
        startIcon={autoplay ? <RepeatIcon /> : <RepeatOneIcon />}>
        {autoplay ? 'Autoplay' : 'Manual'}
      </Button>
      <Button onClick={() => setIsOpen(true)} startIcon={<ListIcon />}>
        Chapters
      </Button>
      <ChapterDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        bookData={bookData}
      />
    </CardActions>
  );
}