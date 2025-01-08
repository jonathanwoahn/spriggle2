import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Replay30Icon from '@mui/icons-material/Replay30';
import Forward30Icon from '@mui/icons-material/Forward30';
import PauseIcon from '@mui/icons-material/Pause';
import { Box, IconButton } from '@mui/material';


export default function PlayerControls({isPlaying, setIsPlaying}: {isPlaying: boolean, setIsPlaying: (isPlaying: boolean) => void}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around', alignItems: 'center',
        pt: 2,
        pb: 2,
      }}>
      <IconButton>
        <SkipPreviousIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
      <IconButton>
        <Replay30Icon sx={{ fontSize: '2rem' }} />
      </IconButton>
      <IconButton onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <PauseIcon sx={{ fontSize: '4rem' }} /> : <PlayArrowIcon sx={{ fontSize: '4rem' }} />}
      </IconButton>
      <IconButton>
        <Forward30Icon sx={{ fontSize: '2rem' }} />
      </IconButton>
      <IconButton>
        <SkipNextIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
    </Box>

  );
}