import { Box } from "@mui/material";
import SettingsForm from "./settings-form";
import { getServerURL } from "@/lib/utils";
import AdminPageHeader from "@/components/admin-page-header";
import SettingsIcon from '@mui/icons-material/Settings';

export default async function SettingsPage() {
  const response = await fetch(`${getServerURL()}/api/settings`);
  if (!response.ok) {
    throw new Error('missing');
  }

  const settings = await response.json();

  // Get DATABASE_URL from environment (mask sensitive parts for display)
  const databaseUrl = process.env.DATABASE_URL || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AdminPageHeader
        title="Settings"
        subtitle="Configure your Spriggle instance"
        icon={<SettingsIcon />}
        breadcrumbs={[{ label: 'Settings' }]}
      />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <SettingsForm settings={settings} databaseUrl={databaseUrl} />
      </Box>
    </Box>
  );
}