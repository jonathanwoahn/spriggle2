import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Replay30Icon from '@mui/icons-material/Replay30';
import Forward30Icon from '@mui/icons-material/Forward30';
import PauseIcon from '@mui/icons-material/Pause';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { IBookData } from '@/lib/types';


export default function PlayerControls({
    isPlaying,
    handlePlayPause,
    bookData,
    order,
    skip,
    isLoading,
  }: {
    isPlaying: boolean,
    handlePlayPause: () => void,
    bookData: IBookData,
    order: string,
    skip: (direction: 'prev' | 'next') => void,
    isLoading: boolean,
  }) {
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around', alignItems: 'center',
      }}>
      <IconButton
        onClick={() => skip('prev')}
        disabled={parseInt(order) === 0 || isLoading}>
        <SkipPreviousIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
      {/* <IconButton>
        <Replay30Icon sx={{ fontSize: '2rem' }} />
      </IconButton> */}
      <Box sx={{position: 'relative'}}>
        <IconButton
          disabled={isLoading}
          onClick={() => handlePlayPause()}>
          {isPlaying ? <PauseIcon sx={{ fontSize: '4rem' }} /> : <PlayArrowIcon sx={{ fontSize: '4rem' }} />}
        </IconButton>
        {isLoading && <CircularProgress
          sx={{position: 'absolute', left: 0, opacity: '50%'}} size={80} color="secondary" />}
      </Box>
      {/* <IconButton>
        <Forward30Icon sx={{ fontSize: '2rem' }} />
      </IconButton> */}
      <IconButton
        onClick={() => skip('next')}
        disabled={parseInt(order) === (bookData.data.nav?.length ?? 0) - 1 || isLoading}>
        <SkipNextIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
    </Box>

  );
}