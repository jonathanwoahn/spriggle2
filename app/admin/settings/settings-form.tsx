'use client';

import { ISetting, saveSettings } from "@/app/actions";
import { Box, Button, Card, CardActions, TextField } from "@mui/material";
import { ChangeEvent, ChangeEventHandler, useState } from "react";

const InputTextField = ({ setting, handleInputChange }: { setting: ISetting, handleInputChange: (val: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}) => {
  return (
    <TextField
      sx={{ width: '100%' }}
      variant="standard"
      label={setting.field}
      name={setting.key}
      placeholder={setting.description}
      value={setting.value}
      onChange={handleInputChange}
    />
  );
}

export default function SettingsForm({settings}: {settings: ISetting[]}) {
  const [ isDirty, setIsDirty ] = useState<boolean>(false);

  const [ form, setForm ] = useState<ISetting[]>(settings);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if(!isDirty) {
      setIsDirty(true);
    }

    const { name, value } = e.target;
    const updatedForm = form.map(setting => {
      if(setting.key === name) {
        return {...setting, value};
      }
      return setting;
    });
    setForm(updatedForm);
    
  }

  const handleSave = async () => {
    await saveSettings(form);

    setIsDirty(false);
  }

  const handleCancel = () =>{
    setForm(settings);
    setIsDirty(false);
  }
  
  return (
    <Box component="form">
      <Card sx={{ width: '100%', marginLeft: 'auto', marginRight: 'auto', maxWidth: '520px' }}>
        <Box
          component="div"
          sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {form.map((setting, idx) => {
              switch(setting.type) {
                case 'string':
                  return <InputTextField key={idx} setting={setting} handleInputChange={handleInputChange} />;
                default:
                  throw new Error('Invalid setting type');
              }
            })}
        </Box>

        <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', gap: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={!isDirty}>Save</Button>
          <Button disabled={!isDirty} onClick={handleCancel}>Cancel</Button>
        </CardActions>
      </Card>
    </Box>

  );
}