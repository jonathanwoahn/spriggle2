'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface AudioContextValue {
  // State
  bookId: string | null;
  chapterOrder: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;

  // Actions
  loadChapter: (bookId: string, order: number, autoplay?: boolean) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (position: number) => void;
  setPlaybackRate: (rate: number) => void;
  preloadChapter: (bookId: string, order: number) => void;

  // Event registration
  addEventListener: (event: string, handler: EventListener) => void;
  removeEventListener: (event: string, handler: EventListener) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

// Preload pool to cache adjacent chapters
const MAX_PRELOAD_POOL_SIZE = 3;

export function AudioProvider({ children }: { children: ReactNode }) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [chapterOrder, setChapterOrder] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Single persistent audio element - create immediately if in browser
  const audioRef = useRef<HTMLAudioElement | null>(
    typeof window !== 'undefined' ? new Audio() : null
  );
  // Track user interaction for autoplay policy
  const hasUserInteractedRef = useRef(false);
  // Preload pool for adjacent chapters
  const preloadPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  // Custom event listeners registered by components
  const eventListenersRef = useRef<Map<string, Set<EventListener>>>(new Map());

  // Set up audio element properties and interaction tracking
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.preload = 'auto';
    }

    // Track user interaction globally
    const handleInteraction = () => {
      hasUserInteractedRef.current = true;
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      // Dispatch to custom listeners
      eventListenersRef.current.get('loadedmetadata')?.forEach(handler => {
        handler(new Event('loadedmetadata'));
      });
    };

    const handleTimeUpdate = () => {
      setPosition(audio.currentTime);
      // Dispatch to custom listeners
      eventListenersRef.current.get('timeupdate')?.forEach(handler => {
        handler(new Event('timeupdate'));
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Dispatch to custom listeners
      eventListenersRef.current.get('ended')?.forEach(handler => {
        handler(new Event('ended'));
      });
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsLoading(false);
      // Dispatch to custom listeners
      eventListenersRef.current.get('error')?.forEach(handler => {
        handler(new Event('error'));
      });
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const loadChapter = useCallback(async (newBookId: string, order: number, autoplay: boolean = false) => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('Audio element not ready yet');
      return;
    }

    // Build the expected URL for comparison
    const expectedUrl = `/api/audio/${newBookId}/${order}`;

    // Check if this exact chapter is already loaded (use URL as source of truth)
    if (audio.src && (audio.src.endsWith(expectedUrl) || audio.src.includes(expectedUrl + '?'))) {
      // Already loaded, just handle autoplay if needed
      if (autoplay && hasUserInteractedRef.current) {
        try {
          await audio.play();
        } catch {
          // Autoplay blocked
        }
      }
      return;
    }

    setIsLoading(true);
    setBookId(newBookId);
    setChapterOrder(order);
    setPosition(0);

    // Set up event listeners BEFORE setting src to avoid race condition
    const loadPromise = new Promise<void>((resolve) => {
      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        resolve();
      };
      const handleError = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        resolve();
      };
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
    });

    // Now set src and load
    audio.src = expectedUrl;
    audio.load();

    // Wait for audio to be ready (with timeout to prevent infinite wait)
    await Promise.race([
      loadPromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10000)) // 10 second timeout
    ]);

    // Restore saved position if any (after audio is ready)
    const savedPosition = localStorage.getItem(`position-${newBookId}-${order}`);
    if (savedPosition) {
      const pos = parseFloat(savedPosition);
      audio.currentTime = pos;
      setPosition(pos);
    }

    setIsLoading(false);

    // Handle autoplay
    if (autoplay && hasUserInteractedRef.current) {
      try {
        await audio.play();
      } catch {
        // Autoplay blocked by browser policy
      }
    }
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    hasUserInteractedRef.current = true;

    // If no source is set, nothing to play
    if (!audio.src) {
      console.warn('No audio source set');
      return;
    }

    // If audio is not ready yet, wait for it
    if (audio.readyState < 2) { // HAVE_CURRENT_DATA
      await new Promise<void>((resolve) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve();
        };
        const handleError = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve();
        };
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        // Timeout after 5 seconds
        setTimeout(resolve, 5000);
      });
    }

    try {
      await audio.play();
    } catch (e) {
      console.warn('Play failed:', e);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((newPosition: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newPosition;
      setPosition(newPosition);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
    }
  }, []);

  const preloadChapter = useCallback((preloadBookId: string, order: number) => {
    const preloadKey = `${preloadBookId}/${order}`;

    // Don't preload if already in pool
    if (preloadPoolRef.current.has(preloadKey)) {
      return;
    }

    // Limit pool size
    if (preloadPoolRef.current.size >= MAX_PRELOAD_POOL_SIZE) {
      // Remove oldest entry
      const firstKey = preloadPoolRef.current.keys().next().value;
      if (firstKey) {
        const oldAudio = preloadPoolRef.current.get(firstKey);
        if (oldAudio) {
          oldAudio.src = '';
        }
        preloadPoolRef.current.delete(firstKey);
      }
    }

    // Create preload audio element
    const preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = `/api/audio/${preloadBookId}/${order}`;
    preloadPoolRef.current.set(preloadKey, preloadAudio);
  }, []);

  const addEventListener = useCallback((event: string, handler: EventListener) => {
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, new Set());
    }
    eventListenersRef.current.get(event)!.add(handler);
  }, []);

  const removeEventListener = useCallback((event: string, handler: EventListener) => {
    eventListenersRef.current.get(event)?.delete(handler);
  }, []);

  const value: AudioContextValue = {
    bookId,
    chapterOrder,
    isPlaying,
    isLoading,
    position,
    duration,
    loadChapter,
    play,
    pause,
    seek,
    setPlaybackRate,
    preloadChapter,
    addEventListener,
    removeEventListener,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
