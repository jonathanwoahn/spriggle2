'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import CollectionsTable from "./collections-table";

export default function CollectionsPage() {
  const collections = [
    {
      title: 'Fantasy',
      books: 10,
    },
    {
      title: 'SciFi',
      books: 10,
    },
    {
      title: 'Young Adult',
      books: 10,
    },
  ];
  
  const handleChangePage = () => {
    console.log('page changed');
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'start',
      }}>
        <CollectionsTable />
        {/* <Paper sx={{ overflow: 'scroll', flex: 1, margin: 2 }}>
          <TableContainer>

            <Table stickyHeader>

              <TableHead>
                <TableRow>
                  <TableCell>Collection</TableCell>
                  <TableCell>Books</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collections.map((collection, idx) => (
                  <TableRow hover key={idx}>
                    <TableCell>{collection.title}</TableCell>
                    <TableCell>{collection.books}</TableCell>
                  </TableRow>
                ))}
              </TableBody>



            </Table>

          </TableContainer>

        </Paper>
        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'end', position: 'relative',  }}>
            <TablePagination
              component="div"
              count={50}
              page={1}
              rowsPerPage={25}
              rowsPerPageOptions={[25, 50, 100]}
              onPageChange={handleChangePage} />
        </Box> */}
    </Box>
    
  );
}