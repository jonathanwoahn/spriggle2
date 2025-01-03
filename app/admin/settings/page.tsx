'use client';
import { ISettings, saveSettings } from "@/app/actions";
import { Box, Button, Card, CardActions, CardContent, TextField, Typography } from "@mui/material";
import { Metadata } from "next";
import { useState } from "react";

// export const metadata: Metadata = {
//   title: 'Sign Up'
// };

export default function SettingsPage({defaultSettings}: {defaultSettings: ISettings}) {
  const [ isValid, setIsValid ] = useState<boolean>(false);
  const [ isDirty, setIsDirty ] = useState<boolean>(false);
  const [ form, setForm ] = useState<ISettings>({
    data: {
      cashmereApiKey: '',
      openaiApiKey: '',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!isDirty) {
      setIsDirty(true);
    }

    const { name, value } = e.target;
    const data = {
      ...form,
      data: {
        ...form.data,
        [name]: value,
      },
    };
    
    setForm(data)
  }

  const handleSave = async () => {

    await saveSettings(form);
    console.log('save settings', form);
  }
  
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', padding: 2 }}>
      <Typography variant="h4">Settings</Typography>

      <Card sx={{width: '50%'}}>
        <Box
          component="form"
          sx={{padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
          <TextField
            sx={{width: '100%'}}
            variant="standard"
            label="Cashmere API Key"
            name="cashmereApiKey"
            value={form.data.cashmereApiKey}
            onChange={handleInputChange}
          />
          <TextField
            sx={{width: '100%'}}
            variant="standard"
            label="OpenAI API Key"
            name="openaiApiKey"
            value={form.data.openaiApiKey}
            onChange={handleInputChange}
          />
        </Box>
        
        <CardActions sx={{display: 'flex', flexDirection: 'row', justifyContent: 'end', gap: 2}}>
          <Button variant="contained" onClick={handleSave} disabled={!isDirty}>Save</Button>
          <Button disabled={!isDirty}>Cancel</Button>
        </CardActions>
      </Card>
    </Box>
  );
}