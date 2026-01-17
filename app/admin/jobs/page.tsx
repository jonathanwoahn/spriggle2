import { Box } from "@mui/material";
import JobsTable from "./jobs-table";
import AdminPageHeader from "@/components/admin-page-header";
import WorkIcon from '@mui/icons-material/Work';

export default function AdminJobsPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
      }}
    >
      <AdminPageHeader
        title="Jobs"
        subtitle="Monitor audio processing jobs"
        icon={<WorkIcon />}
        breadcrumbs={[{ label: 'Jobs' }]}
      />
      <JobsTable />
    </Box>
  );
}