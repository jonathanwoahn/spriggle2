'use client';

import { Box, Card, CardActionArea, CardContent, CardHeader } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import PlayerCardActions, { SPEEDS } from "./player-card-actions";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AudioChapterManager } from './audio-manager';
import BookCoverImage from "@/components/book-cover-image";

declare global {
  interface Document {
    userInteracted?: boolean;
  }
}

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
  const [autoplay, setAutoplay] = useState(true);
  const [speed, setSpeed] = useState<{value: number, label: string}>(SPEEDS[1]);
  
  const isSeekingRef = useRef(false);

  const audioManagerRef = useRef<AudioChapterManager | null>(null);
  
  useEffect(() => {
    audioManagerRef.current = new AudioChapterManager(new Audio());

    if(!audioManagerRef.current) return;

    const handleLoadedmetadata = () => {
      if (!audioManagerRef.current) return;

      setDuration(audioManagerRef.current.duration);
    }

    const handleTimeupdate = () => {
      if (!isSeekingRef.current && !!audioManagerRef.current) {
        setPosition(audioManagerRef.current.currentTime);
      }
    }

    const handleEnded = () => {
      if (!audioManagerRef.current) return;

      const currentOrder = parseInt(params.order);
      if(currentOrder + 1 < bookData.data.nav.length) {
        handleSkip('next');
      }
    }

    audioManagerRef.current.addEventListener('loadedmetadata', handleLoadedmetadata);
    audioManagerRef.current.addEventListener('timeupdate', handleTimeupdate);
    audioManagerRef.current.addEventListener('ended',handleEnded)

    return () => {
      if (!audioManagerRef.current) return;

      audioManagerRef.current.removeEventListener('loadedmetadata', handleLoadedmetadata);
      audioManagerRef.current.removeEventListener('timeupdate', handleTimeupdate);
      audioManagerRef.current.removeEventListener('ended',() => handleEnded);
    };
  }, []);

  useEffect(() => {
    const loadChapter = async () => {
      if (!audioManagerRef.current) return;

      setIsLoading(true);
      await audioManagerRef.current.prepareChapter(params.id, parseInt(params.order));
      setIsLoading(false);

      if(audioManagerRef.current && autoplay) {
        audioManagerRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            // Autoplay is disabled by the browser unless a user has interacted, so it requires a click first before playing
            // This is unavoidable and is a security feature of the browser
          });
      }
    };

    loadChapter();

    return () => {
      if(audioManagerRef.current) {
        audioManagerRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [params.id, params.order]);

  useEffect(() => {
    if(!audioManagerRef.current) return;
    audioManagerRef.current.playbackRate(speed.value);
  }, [speed])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: bookData.data.title,
        artist: bookData.data.creators.join(', '),
        album: bookData.data.nav[parseInt(params.order)].label,
        artwork: [
          { src: `https://omnibk.ai/api/v1/book/${bookData.uuid}/cover_image`}
        ]
      });

      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('seekbackward', () => handleSeek(position - 10));
      navigator.mediaSession.setActionHandler('seekforward', () => handleSeek(position + 10));
      navigator.mediaSession.setActionHandler('previoustrack', () => handleSkip('prev'));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleSkip('next'));
    }
  }, [bookData, params.order]);  
  
  
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
    if(isPlaying) {
      audioManagerRef.current?.pause();
      setIsPlaying(false);
    }

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
        <PlayerControls
          isLoading={isLoading}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          bookData={bookData}
          order={params.order}
          skip={handleSkip}
        />
      </CardContent>
      <PlayerCardActions
        speed={speed}
        setSpeed={setSpeed}
        autoplay={autoplay}
        setAutoplay={setAutoplay}
        bookData={bookData} />
    </Card>
  );
}