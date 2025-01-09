'use client';

import { Box, Card, CardActionArea, CardContent, CardHeader } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import PlayerCardActions from "./player-card-actions";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AudioChapterManager } from './audio-manager';
import BookCoverImage from "@/components/book-cover-image";

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

export default function MediaPlayer({bookData}: {bookData: IBookData}) {
  const params = useParams<{id: string, order: string}>();

  const totalLength = 10000;
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioManagerRef = useRef<AudioChapterManager | null>(null);
  
  useEffect(() => {
    audioManagerRef.current = new AudioChapterManager();
    return () => {
      // Cleanup
      // audioManagerRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const loadChapter = async () => {
      if (!audioManagerRef.current) return;

      setIsLoading(true);
      try {
        // Get block IDs for current chapter
        // const chapterBlocks = await fetchChapterBlocks(params.id, params.order);

        const response = await fetch(`/api/book/${params.id}/audio/${params.order}`);
        if(!response.ok) {
          throw new Error('Failed to load chapter');
        }
        const blocks = await response.json();

        // Prepare the chapter - this will load metadata first
        await audioManagerRef.current.prepareChapter(blocks, params.id);

        // // Once metadata is loaded, we can show total duration
        // setDuration(audioManagerRef.current.getDuration());
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load chapter:', error);
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [params.id, params.order]);
  

  // useEffect(() => {
  //   // When chapter changes, load new audio
  //   const loadChapter = async () => {
  //     if (!audioManagerRef.current) return;

  //     // Get block IDs for current chapter
  //     // const chapterBlocks = await fetchChapterBlocks(params.id, params.order);

  //     // Load audio files
  //     // const duration = await audioManagerRef.current.loadChapter(
  //     //   chapterBlocks,
  //     //   bookData.uuid
  //     // );
  //     // setDuration(duration);
  //   };

  //   loadChapter();
  // }, [params.id, params.order]);

  // // Update position during playback
  // useEffect(() => {
  //   if (!isPlaying) return;

  //   const interval = setInterval(() => {
  //     if (audioManagerRef.current) {
  //       setPosition(audioManagerRef.current.getCurrentTime());
  //     }
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, [isPlaying]);

  // const handlePlayPause = () => {
  //   if (!audioManagerRef.current) return;

  //   if (isPlaying) {
  //     audioManagerRef.current.pause();
  //   } else {
  //     audioManagerRef.current.play(position);
  //   }
  //   setIsPlaying(!isPlaying);
  // };

  const handleSeek = (newPosition: number) => {
    // if (!audioManagerRef.current) return;
    // audioManagerRef.current.seek(newPosition);
    // setPosition(newPosition);
  };
  
  return (
    <Card>
      <CardActionArea href={`/book/${bookData.uuid}`}>
        <CardHeader subheader={bookData.data.title} />
      </CardActionArea>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Box sx={{borderRadius: 2, overflow: 'hidden', height: '250px'}}>
          <BookCoverImage bookId={bookData.uuid} />
        </Box>
        </Box>
        <PlayerProgress
          position={position}
          setPosition={handleSeek}
          duration={duration}
          totalLength={totalLength}
          chapterTitle={bookData.data.nav[parseInt(params.order)].label}
        />
        <PlayerControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </CardContent>
      <PlayerCardActions bookData={bookData} />
    </Card>
  );
}