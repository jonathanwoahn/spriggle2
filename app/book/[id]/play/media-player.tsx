'use client';

import { Box, Card, CardActionArea, CardContent, CardHeader } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import PlayerCardActions from "./player-card-actions";
import { useState } from "react";
import Image from "next/image";

export interface INav {
  order: number;
  label: string;
}

export interface IBookData {
  uuid: string;
  data: {
    title: string;
    creators: string[];
    nav: INav[];
  },
}

// export default function MediaPlayer({id}: {id: string}) {
export default function MediaPlayer({bookData}: {bookData: IBookData}) {
  const duration = 200;
  const totalLength = 5000;
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
 return (
   <Card>
     <CardActionArea href={`/book/${bookData.uuid}`}>
       <CardHeader subheader={bookData.data.title} />
     </CardActionArea>
     <CardContent>
       <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Box sx={{borderRadius: 2, overflow: 'hidden'}}>
          <Image src={`/api/book/${bookData.uuid}/cover`} alt={"Book"} height={300} width={225} priority={true} />
        </Box>
       </Box>
       <PlayerProgress position={position} setPosition={setPosition} duration={duration} totalLength={totalLength} />
       <PlayerControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
     </CardContent>
     <PlayerCardActions bookData={bookData} />
   </Card>
 );
}