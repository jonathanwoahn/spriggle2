'use client';

import { Box, Card, CardActionArea, CardContent, CardHeader } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import PlayerCardActions from "./player-card-actions";
import { useState } from "react";

export default function MediaPlayer({id}: {id: string}) {
  const duration = 200;
  const totalLength = 5000;
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
 return (
   <Card>
     <CardActionArea href={`/book/${id}`}>
       <CardHeader subheader="Harry Potter and the Sorcerer's Stone" />
     </CardActionArea>
     <CardContent>
       <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
         <Box sx={{ height: '240px', width: '180px', bgcolor: 'gray', borderRadius: 2, }}></Box>
       </Box>
       <PlayerProgress position={position} setPosition={setPosition} duration={duration} totalLength={totalLength} />
       <PlayerControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
     </CardContent>
     <PlayerCardActions />
   </Card>
 );
}