'use client';
import { createClient } from "@/utils/supabase/client";
import { Box, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { format } from 'date-fns';

const supabase = createClient();

export default function JobsTable() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalJobs, setTotalJobs] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [selectedTab, setSelectedTab] = useState('failed');


  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: order === 'asc' })
        .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1)
        .eq('status', selectedTab);

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          query = query.ilike(key, `%${filters[key]}%`);
        }
      });

      const { data, error, count } = await query;

      if (error) console.error('Error fetching jobs:', error);
      else {
        setJobs(data);
        setTotalJobs(count || 0);
      }
    };

    fetchJobs();
  }, [page, rowsPerPage, order, orderBy, filters, selectedTab]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    setPage(0);
  };
  
  return (
    <>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Failed" value="failed" />
        <Tab label="Pending" value="pending" />
        <Tab label="Processing" value="processing" />
        <Tab label="Completed" value="completed" />
      </Tabs>
      <Paper sx={{ overflow: 'hidden', flex: 1, margin: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader sx={{tableLayout: 'fixed'}}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    Created At
                  </TableSortLabel>
                </TableCell>
                
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleRequestSort('id')}
                  >
                    Job ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>                
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleRequestSort('type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Log</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job, idx) => (
                <TableRow hover key={idx}>
                  <TableCell>{format(new Date(job.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>{job.id}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{JSON.stringify(job.data)}</TableCell>
                  <TableCell>{JSON.stringify(job.log)}</TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>No "{selectedTab}" jobs found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'end', position: 'sticky', bottom: 0, bgcolor: 'black' }}>
        <TablePagination
          component="div"
          count={totalJobs}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[100, 250, 500]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );
}