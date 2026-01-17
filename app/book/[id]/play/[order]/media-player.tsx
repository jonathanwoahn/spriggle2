'use client';

import { Alert, Box, IconButton, Typography } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AudioChapterManager } from './audio-manager';
import BookCoverImage from "@/components/book-cover-image";
import { PlaybackReporter } from "./playback-reporter";
import { IBlockMetadata, IBookData } from "@/lib/types";
import { useAccentColors } from "@/context/accent-color-context";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChapterDrawer from '../../chapter-drawer';

declare global {
  interface Document {
    userInteracted?: boolean;
  }
}

interface MediaPlayerProps {
  bookData: IBookData;
  metadata: IBlockMetadata[];
  voiceName?: string | null;
}

export default function MediaPlayer({ bookData, metadata, voiceName }: MediaPlayerProps) {
  const params = useParams<{id: string, order: string}>();
  const router = useRouter();
  const { colors: accentColors } = useAccentColors();

  // Extract primary color from accent colors (remove alpha suffix if present)
  const primaryColor = accentColors.primary.replace(/[a-f0-9]{2}$/i, '') || '#9966FF';
  const secondaryColor = accentColors.secondary.replace(/[a-f0-9]{2}$/i, '') || '#7A52CC';

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [availableSections, setAvailableSections] = useState<number[]>([]);

  const isSeekingRef = useRef(false);
  const audioManagerRef = useRef<AudioChapterManager | null>(null);
  const reporterRef = useRef<PlaybackReporter>(PlaybackReporter.getInstance(metadata));

  // Fetch available sections (ones with audio) on mount
  useEffect(() => {
    const fetchAvailableSections = async () => {
      try {
        const res = await fetch(`/api/metadata?bookId=${params.id}&type=section`);
        if (res.ok) {
          const { data } = await res.json();
          const sections = data.map((d: any) => d.sectionOrder).sort((a: number, b: number) => a - b);
          setAvailableSections(sections);
        }
      } catch {
        // Failed to fetch, use nav as fallback
      }
    };
    fetchAvailableSections();
  }, [params.id]);

  // when the application loads, create an audio manager and set up event listeners
  useEffect(() => {
    audioManagerRef.current = new AudioChapterManager(new Audio());

    if(!audioManagerRef.current) return;

    const handleLoadedmetadata = () => {
      if (!audioManagerRef.current) return;
      setDuration(audioManagerRef.current.duration);
      setAudioError(null); // Clear any previous error
    }

    const handleTimeupdate = () => {
      if (!isSeekingRef.current && !!audioManagerRef.current) {
        const currentTime = audioManagerRef.current.currentTime;
        reporterRef.current?.reportPlayback(currentTime);
        setPosition(currentTime);
        localStorage.setItem(`position-${params.id}-${params.order}`, currentTime.toString());
      }
    }

    const handleEnded = () => {
      if (!audioManagerRef.current) return;
      const currentOrder = parseInt(params.order);
      // Find the next available section
      const nextSection = availableSections.find(s => s > currentOrder);
      if (nextSection !== undefined && autoplay) {
        router.push(`/book/${params.id}/play/${nextSection}`);
      }
    }

    const handleError = () => {
      setAudioError('Audio not available for this chapter. It may not have been processed yet.');
      setIsLoading(false);
    }

    audioManagerRef.current.addEventListener('loadedmetadata', handleLoadedmetadata);
    audioManagerRef.current.addEventListener('timeupdate', handleTimeupdate);
    audioManagerRef.current.addEventListener('ended', handleEnded);
    audioManagerRef.current.addEventListener('error', handleError);

    return () => {
      if (!audioManagerRef.current) return;
      audioManagerRef.current.removeEventListener('loadedmetadata', handleLoadedmetadata);
      audioManagerRef.current.removeEventListener('timeupdate', handleTimeupdate);
      audioManagerRef.current.removeEventListener('ended', handleEnded);
      audioManagerRef.current.removeEventListener('error', handleError);
    };
  }, [availableSections, autoplay, params.id, params.order, router]);

  useEffect(() => {
    const loadChapter = async () => {
      if (!audioManagerRef.current) return;

      setIsLoading(true);
      setAudioError(null); // Clear previous error when loading new chapter
      await audioManagerRef.current.prepareChapter(params.id, parseInt(params.order));
      const savedPosition = localStorage.getItem(`position-${params.id}-${params.order}`);

      if(savedPosition) {
        setPosition(parseFloat(savedPosition));
        audioManagerRef.current.seek(parseFloat(savedPosition));
      }

      setIsLoading(false);

      if(audioManagerRef.current && autoplay) {
        audioManagerRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay is disabled by the browser unless a user has interacted
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
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: Array.isArray(bookData.data.title) ? bookData.data.title.join(', ') : bookData.data.title,
        artist: bookData.data.creators?.join(', ') ?? 'Unknown Artist',
        album: bookData.data.nav?.[parseInt(params.order)]?.label ?? 'Unknown Album',
        artwork: [
          { src: `https://omnibk.ai/api/v2/omnipub/${bookData.uuid}/cover_image`}
        ]
      });

      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('seekbackward', () => handleSkipTime(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => handleSkipTime(15));
      navigator.mediaSession.setActionHandler('previoustrack', () => handleSkipChapter('prev'));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleSkipChapter('next'));
    }
  }, [bookData, params.order, position]);


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
    }
    isSeekingRef.current = false;
  }

  const handleSkipChapter = (dir: 'prev' | 'next') => {
    const currentOrder = parseInt(params.order);

    // Find the next/prev available section with audio
    let targetSection: number | undefined;
    if (dir === 'next') {
      targetSection = availableSections.find(s => s > currentOrder);
    } else {
      // Find the last section that's less than current
      const prevSections = availableSections.filter(s => s < currentOrder);
      targetSection = prevSections.length > 0 ? prevSections[prevSections.length - 1] : undefined;
    }

    if (targetSection === undefined) return;

    if(isPlaying) {
      audioManagerRef.current?.pause();
      setIsPlaying(false);
    }

    router.push(`/book/${params.id}/play/${targetSection}`);
  }

  const handleSkipTime = (seconds: number) => {
    if (!audioManagerRef.current) return;
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    setPosition(newPosition);
    audioManagerRef.current.seek(newPosition);
  }

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  }

  const chapterTitle = (bookData.data.nav || [])[parseInt(params.order)]?.label || 'Chapter';

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { xs: '100%', md: '500px' },
        mx: 'auto',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          flexShrink: 0,
        }}
      >
        <IconButton
          href={`/book/${bookData.uuid}`}
          sx={{
            color: primaryColor,
            '&:hover': {
              bgcolor: `${primaryColor}15`,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          onClick={() => setChaptersOpen(true)}
          sx={{
            color: primaryColor,
            '&:hover': {
              bgcolor: `${primaryColor}15`,
            },
          }}
        >
          <MenuBookIcon />
        </IconButton>
      </Box>

      {/* Cover Image - takes remaining space */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {audioError ? (
          <Alert
            severity="warning"
            sx={{
              maxWidth: '100%',
              mx: 2,
            }}
          >
            {audioError}
          </Alert>
        ) : (
          <Box
            sx={{
              maxWidth: '60%',
              maxHeight: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: `0 12px 40px ${primaryColor}35`,
            }}
          >
            <BookCoverImage bookId={bookData.uuid} height={0} width="100%" />
          </Box>
        )}
      </Box>

      {/* Book Info */}
      <Box sx={{ textAlign: 'center', px: 3, pt: 2, pb: 1, flexShrink: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {bookData.data.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.25,
          }}
        >
          {chapterTitle}
        </Typography>
        {voiceName && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              mt: 0.5,
              display: 'block',
            }}
          >
            Narrated by {voiceName}
          </Typography>
        )}
      </Box>

      {/* Progress */}
      <Box sx={{ px: 3, flexShrink: 0 }}>
        <PlayerProgress
          position={position}
          setPosition={handleSeek}
          onSeekEnd={handleSeekEnd}
          duration={duration}
          onSeekStart={handleSeekStart}
          primaryColor={primaryColor}
        />
      </Box>

      {/* Controls */}
      <Box sx={{ px: 3, pb: { xs: 3, md: 2 }, flexShrink: 0 }}>
        <PlayerControls
          isLoading={isLoading}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          onSkipTime={handleSkipTime}
          primaryColor={primaryColor}
        />
      </Box>

      {/* Chapter Drawer */}
      <ChapterDrawer
        isOpen={chaptersOpen}
        setIsOpen={setChaptersOpen}
        bookData={bookData}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </Box>
  );
}
