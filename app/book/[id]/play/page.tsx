// 'use client';

import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, IconButton, Slider, Typography } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import ListIcon from '@mui/icons-material/List';
// import SpeedIcon from '@mui/icons-material/Speed';
import ChapterDrawer from "../chapter-drawer";
import { useState } from "react";

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Replay30Icon from '@mui/icons-material/Replay30';
import Forward30Icon from '@mui/icons-material/Forward30';
import PauseIcon from '@mui/icons-material/Pause';
import PlayerCardActions from "./player-card-actions";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import MediaPlayer from "./media-player";

export default async function PlayBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Box sx={{p: 2, pt: 4, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',}}>
      <MediaPlayer id={id} />
      {/* <Card>
        <CardActionArea href={`/book/${id}`}>
          <CardHeader 
            subheader="Harry Potter and the Sorcerer's Stone"
          />

        </CardActionArea>
        <CardContent>
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Box sx={{height: '300px', width: '240px', bgcolor: 'gray', borderRadius: 2, }}></Box>
          </Box>
          <PlayerProgress />
          <PlayerControls />
        </CardContent>
        <PlayerCardActions />
      </Card> */}
    </Box>
  );
}