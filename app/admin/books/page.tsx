import { Box, TablePagination, Typography } from "@mui/material";
import BooksTable from "./books-table";

export default function BooksPage() {

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'start',
      }}>
      <Typography variant="h4" sx={{ pl: 2, pt: 2 }}>Books</Typography>
      <BooksTable />
    </Box>
  );

}