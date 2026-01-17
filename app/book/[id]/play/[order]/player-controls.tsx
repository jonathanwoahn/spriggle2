import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Box, CircularProgress, IconButton } from '@mui/material';

interface PlayerControlsProps {
  isPlaying: boolean;
  handlePlayPause: () => void;
  onSkipTime: (seconds: number) => void;
  isLoading: boolean;
  primaryColor?: string;
}

export default function PlayerControls({
    isPlaying,
    handlePlayPause,
    onSkipTime,
    isLoading,
    primaryColor = '#9966FF',
  }: PlayerControlsProps) {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 3, md: 4 },
        py: 1,
      }}
    >
      {/* Skip Back 15s */}
      <IconButton
        onClick={() => onSkipTime(-15)}
        disabled={isLoading}
        sx={{
          color: primaryColor,
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: `${primaryColor}12`,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:disabled': {
            color: `${primaryColor}40`,
          },
          transition: 'transform 0.1s ease',
        }}
      >
        <Replay10Icon sx={{ fontSize: '2.5rem' }} />
      </IconButton>

      {/* Play/Pause */}
      <Box sx={{ position: 'relative' }}>
        <IconButton
          disabled={isLoading}
          onClick={() => handlePlayPause()}
          sx={{
            width: 72,
            height: 72,
            background: primaryColor,
            color: 'white',
            boxShadow: `0 4px 20px ${primaryColor}40`,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              background: primaryColor,
              transform: 'scale(1.05)',
              boxShadow: `0 6px 24px ${primaryColor}50`,
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '&:disabled': {
              background: `${primaryColor}40`,
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: '2.5rem' }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: '2.5rem' }} />
          )}
        </IconButton>
        {isLoading && (
          <CircularProgress
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-40px',
              marginLeft: '-40px',
              color: primaryColor,
              opacity: 0.6,
            }}
            size={80}
          />
        )}
      </Box>

      {/* Skip Forward 15s */}
      <IconButton
        onClick={() => onSkipTime(15)}
        disabled={isLoading}
        sx={{
          color: primaryColor,
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: `${primaryColor}12`,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:disabled': {
            color: `${primaryColor}40`,
          },
          transition: 'transform 0.1s ease',
        }}
      >
        <Forward10Icon sx={{ fontSize: '2.5rem' }} />
      </IconButton>
    </Box>
  );
}
