import { Box, TablePagination, Typography } from "@mui/material";
import JobsTable from "./jobs-table";

export default function AdminJobsPage() {

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'start',
      }}>
      <JobsTable />
    </Box>    
  );

}