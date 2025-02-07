'use client';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';

export default function ToggleWorker() {

  const [isOn, setIsOn] = useState(false);
  
  
  return (
    <Tooltip title={'Toggles the worker on and off. Currently it is ' + (isOn ? 'on' : 'off')}>
      <IconButton onClick={() => setIsOn(!isOn)}>
        {isOn ? <RadioButtonCheckedIcon color="success" /> : <RadioButtonUncheckedIcon color="error" />}
      </IconButton>

    </Tooltip>
  );
}