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
      <Typography variant="h4" sx={{ pl: 2, pt: 2 }}>Conversion Jobs</Typography>
      <JobsTable />
    </Box>    
  );

}