'use client';

import ListIcon from '@mui/icons-material/List';
import SpeedIcon from '@mui/icons-material/Speed';
import { Button, CardActions } from '@mui/material';
import { useState } from 'react';
import ChapterDrawer from '../chapter-drawer';
import { IBookData } from './media-player';



export default function PlayerCardActions({bookData}: {bookData: IBookData}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
      <Button startIcon={<SpeedIcon />}>
        Speed
      </Button>
      <Button onClick={() => setIsOpen(true)} startIcon={<ListIcon />}>
        Chapters
      </Button>
      <ChapterDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={bookData.data.title}
        navItems={bookData.data.nav} 
      />
    </CardActions>
  );
}