import { Box, Typography } from "@mui/material";
import SettingsForm from "./settings-form";
import { getServerURL } from "@/lib/utils";

export default async function SettingsPage() {
  const response = await fetch(`${getServerURL()}/api/settings`);
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