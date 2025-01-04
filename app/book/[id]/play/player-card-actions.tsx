'use client';

import ListIcon from '@mui/icons-material/List';
import SpeedIcon from '@mui/icons-material/Speed';
import { Button, CardActions } from '@mui/material';
import { useState } from 'react';
import ChapterDrawer from '../chapter-drawer';



export default function PlayerCardActions() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
      <Button startIcon={<SpeedIcon />}>
        Speed
      </Button>
      <Button onClick={() => setIsOpen(true)} startIcon={<ListIcon />}>
        Chapters
      </Button>
      <ChapterDrawer isOpen={isOpen} setIsOpen={setIsOpen} title="Chapters" />
    </CardActions>
  );
}