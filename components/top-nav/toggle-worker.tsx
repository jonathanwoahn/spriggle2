'use client';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ToggleWorker() {
  const [isOn, setIsOn] = useState<boolean | undefined>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if(event.data.task === 'state') {
            setIsOn(event.data.isOn);
            setIsProcessing(event.data.isProcessing);
          }
        });

        navigator.serviceWorker.controller?.postMessage({ task: 'state'});
      });

    }
  },[]);

  const handleOnOffClick = (state: boolean) => {
    if(!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({ task: 'changeState', status: state });
  }
  
  
  return (
    <Box component="div" sx={{ position: 'relative', display: 'inline-block' }}>
        <IconButton onClick={() => handleOnOffClick(!isOn)} sx={{zIndex: 1000}} disabled={isOn === undefined}>
          {isOn ? <RadioButtonCheckedIcon color={isOn === undefined ? undefined : "success"} /> : <RadioButtonUncheckedIcon color={isOn === undefined ? undefined : 'error'} />}
        </IconButton>
      {isProcessing && <CircularProgress
        color="success"
        thickness={2}
        size={28}
        sx={{ position: 'absolute', left: '15%', top: '15%', transform: 'translate(-50%, -50%)',  }} />}
    </Box>
  );
}