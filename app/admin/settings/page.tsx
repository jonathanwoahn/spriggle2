import { Box, Typography } from "@mui/material";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";


  const response = await fetch(`${defaultUrl}/api/settings`);
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