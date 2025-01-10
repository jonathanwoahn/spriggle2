'use client';

import { Box, Card, CardActionArea, CardContent, CardHeader } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import PlayerCardActions from "./player-card-actions";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const totalLength = 10000;
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isSeekingRef = useRef(false);

  const audioManagerRef = useRef<AudioChapterManager | null>(null);
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioManagerRef.current = new AudioChapterManager(new Audio());

    if(!audioManagerRef.current) return;

    audioManagerRef.current.addEventListener('loadedmetadata', () => {
      if (!audioManagerRef.current) return;

      setDuration(audioManagerRef.current.duration);
    });

    audioManagerRef.current.addEventListener('timeupdate', () => {
      if (!isSeekingRef.current && !!audioManagerRef.current) {
        setPosition(audioManagerRef.current.currentTime);
      }
    });

    return () => {
      if (!audioManagerRef.current) return;

      audioManagerRef.current.removeEventListener('loadedmetadata', () => {
        if (!audioManagerRef.current) return;

        setDuration(audioManagerRef.current.duration);
      });

      audioManagerRef.current.removeEventListener('timeupdate', () => {
        if (!isSeekingRef.current) {
          if (!audioManagerRef.current) return;

          setPosition(audioManagerRef.current.currentTime);
        }
      });
    };
    
    // if(audioRef.current) {
    //   audioManagerRef.current = new AudioChapterManager(audioRef.current);
    //   audioRef.current.addEventListener('loadedmetadata', () => {
    //     if (audioRef.current) {
    //       setDuration(audioRef.current.duration);
    //     }
    //   });

    //   audioRef.current.addEventListener('timeupdate', () => {
    //     if (audioRef.current && !isSeekingRef.current) {
    //       setPosition(audioRef.current.currentTime);
    //     }
    //   });    
    // }
  }, []);

  useEffect(() => {
    const loadChapter = async () => {
      if (!audioManagerRef.current) return;

      setIsLoading(true);
      await audioManagerRef.current.prepareChapter(params.id, parseInt(params.order));
      setIsLoading(false);
    };

    loadChapter();
  }, [params.id, params.order]);

  const handlePlayPause = () => {
    if (!audioManagerRef.current) return;
    if(isPlaying) {
      audioManagerRef.current.pause();
    } else {
      audioManagerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }
  
  const handleSeek = (newPosition: number) => {
    if(!audioManagerRef.current) return;
    setPosition(newPosition);
  };

  const handleSeekEnd = () => {
    if(audioManagerRef.current) {
      audioManagerRef.current.seek(position);
    } else {
      console.error('audioManagerRef.current is null');
    }
    isSeekingRef.current = false;
  }

  const handleSkip = (dir: 'prev' | 'next') => {
    const currentOrder = parseInt(params.order);
    const newOrder = dir === 'prev' ? currentOrder - 1 : currentOrder + 1;
    
    if(newOrder < 0 || newOrder >= bookData.data.nav.length) return;
    router.push(`/book/${params.id}/play/${newOrder}`);
  }

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  }

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
          onSeekEnd={handleSeekEnd}
          duration={duration}
          totalLength={totalLength}
          chapterTitle={bookData.data.nav[parseInt(params.order)].label}
          onSeekStart={handleSeekStart}
        />
        {/* <audio ref={audioRef} /> */}
        <PlayerControls
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          bookData={bookData}
          order={params.order}
          skip={handleSkip}
        />
      </CardContent>
      <PlayerCardActions bookData={bookData} />
    </Card>
  );
}