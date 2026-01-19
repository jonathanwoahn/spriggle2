'use client';

import { Alert, Box, IconButton, Typography } from "@mui/material";
import PlayerProgress from "./player-progress";
import PlayerControls from "./player-controls";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import BookCoverImage from "@/components/book-cover-image";
import { PlaybackReporter } from "./playback-reporter";
import { IBlockMetadata, IBookData } from "@/lib/types";
import { useAccentColors } from "@/context/accent-color-context";
import { useAudio } from "@/context/audio-context";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChapterDrawer from '../../chapter-drawer';

interface MediaPlayerProps {
  bookData: IBookData;
  metadata: IBlockMetadata[];
  voiceName?: string | null;
}

export default function MediaPlayer({ bookData, metadata, voiceName }: MediaPlayerProps) {
  const params = useParams<{id: string, order: string}>();
  const { colors: accentColors } = useAccentColors();
  const {
    loadChapter,
    play,
    pause,
    seek,
    preloadChapter,
    isPlaying,
    isLoading,
    position: audioPosition,
    duration: audioDuration,
    chapterOrder,
    addEventListener,
    removeEventListener,
  } = useAudio();

  // Use chapterOrder from audio context (updated immediately) instead of params.order (stale after history.replaceState)
  const currentOrder = chapterOrder ?? parseInt(params.order);

  // Extract primary color from accent colors (remove alpha suffix if present)
  const primaryColor = accentColors.primary.replace(/[a-f0-9]{2}$/i, '') || '#9966FF';
  const secondaryColor = accentColors.secondary.replace(/[a-f0-9]{2}$/i, '') || '#7A52CC';

  // Local position for smooth seeking
  const [localPosition, setLocalPosition] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [availableSections, setAvailableSections] = useState<number[]>([]);

  const isSeekingRef = useRef(false);
  const reporterRef = useRef<PlaybackReporter>(PlaybackReporter.getInstance(metadata));
  const availableSectionsRef = useRef<number[]>([]);
  const autoplayRef = useRef(true);

  // Use audioPosition when not seeking, localPosition when seeking
  const position = isSeekingRef.current ? localPosition : audioPosition;
  const duration = audioDuration;

  // Fetch available sections (ones with audio) on mount
  useEffect(() => {
    const fetchAvailableSections = async () => {
      try {
        const res = await fetch(`/api/metadata?bookId=${params.id}&type=section`);
        if (res.ok) {
          const { data } = await res.json();
          const sections = data.map((d: any) => d.sectionOrder).sort((a: number, b: number) => a - b);
          setAvailableSections(sections);
          availableSectionsRef.current = sections;
        }
      } catch {
        // Failed to fetch, use nav as fallback
      }
    };
    fetchAvailableSections();
  }, [params.id]);

  // Keep autoplayRef in sync
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  // Set up event listeners for the audio context
  useEffect(() => {
    const handleError = () => {
      setAudioError('Audio not available for this chapter. It may not have been processed yet.');
    };

    addEventListener('error', handleError);

    return () => {
      removeEventListener('error', handleError);
    };
  }, [addEventListener, removeEventListener]);

  // Handle chapter end - separate effect with currentOrder dependency
  useEffect(() => {
    const handleEnded = () => {
      // Find the next available section
      const nextSection = availableSectionsRef.current.find(s => s > currentOrder);
      if (nextSection !== undefined && autoplayRef.current) {
        // Use loadChapter + history.replaceState instead of router.push
        loadChapter(params.id, nextSection, true);
        window.history.replaceState(null, '', `/book/${params.id}/play/${nextSection}`);
      }
    };

    addEventListener('ended', handleEnded);

    return () => {
      removeEventListener('ended', handleEnded);
    };
  }, [params.id, currentOrder, loadChapter, addEventListener, removeEventListener]);

  // Handle time updates for playback reporting
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        reporterRef.current?.reportPlayback(audioPosition);
        localStorage.setItem(`position-${params.id}-${currentOrder}`, audioPosition.toString());
      }
    };

    addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [params.id, currentOrder, audioPosition, addEventListener, removeEventListener]);

  // Load chapter when route params change
  useEffect(() => {
    setAudioError(null);
    loadChapter(params.id, parseInt(params.order), autoplayRef.current);
  }, [params.id, params.order, loadChapter]);

  // Preload adjacent chapters
  useEffect(() => {
    if (availableSections.length === 0) return;

    const nextSection = availableSections.find(s => s > currentOrder);
    const prevSections = availableSections.filter(s => s < currentOrder);
    const prevSection = prevSections.length > 0 ? prevSections[prevSections.length - 1] : undefined;

    if (nextSection !== undefined) {
      preloadChapter(params.id, nextSection);
    }
    if (prevSection !== undefined) {
      preloadChapter(params.id, prevSection);
    }
  }, [params.id, currentOrder, availableSections, preloadChapter]);


  // Media Session API for OS-level controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: Array.isArray(bookData.data.title) ? bookData.data.title.join(', ') : bookData.data.title,
        artist: bookData.data.creators?.join(', ') ?? 'Unknown Artist',
        album: bookData.data.nav?.[currentOrder]?.label ?? 'Unknown Album',
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
  }, [bookData, currentOrder, position]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleSeek = useCallback((newPosition: number) => {
    setLocalPosition(newPosition);
  }, []);

  const handleSeekEnd = useCallback(() => {
    seek(localPosition);
    isSeekingRef.current = false;
  }, [localPosition, seek]);

  const handleSkipChapter = useCallback((dir: 'prev' | 'next') => {
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

    // Use loadChapter + history.replaceState for instant navigation
    loadChapter(params.id, targetSection, isPlaying);
    window.history.replaceState(null, '', `/book/${params.id}/play/${targetSection}`);
  }, [params.id, currentOrder, availableSections, isPlaying, loadChapter]);

  const handleSkipTime = useCallback((seconds: number) => {
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    seek(newPosition);
  }, [duration, position, seek]);

  const handleSeekStart = useCallback(() => {
    isSeekingRef.current = true;
    setLocalPosition(audioPosition);
  }, [audioPosition]);

  const handleChapterSelect = useCallback((order: number) => {
    loadChapter(params.id, order, isPlaying);
    window.history.replaceState(null, '', `/book/${params.id}/play/${order}`);
  }, [params.id, isPlaying, loadChapter]);

  const chapterTitle = (bookData.data.nav || [])[currentOrder]?.label || 'Chapter';

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
        onChapterSelect={handleChapterSelect}
      />
    </Box>
  );
}
