import { ISettings, saveSettings } from "@/app/actions";
import { Box, Button, Card, CardActions, CardContent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const response = await fetch('http://localhost:3000/api/settings');
  if(!response.ok) {
    throw new Error('missing');
  }

  const settings = await response.json();
  
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', padding: 2,  }}>
      <Typography variant="h4">Settings</Typography>
      <SettingsForm settings={settings} />
    </Box>
  );
}