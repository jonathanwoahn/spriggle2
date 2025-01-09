'use client';

import { Box, Button, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CollectionDialogForm from "./collection-dialog-form";

export default function CollectionsTable() {
  const [collections, setCollections] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCollections, setTotalCollections] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [selectedTab, setSelectedTab] = useState('failed');

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await fetch(`/api/collections?page=${page}&rowsPerPage=${rowsPerPage}&order=${order}&orderBy=${orderBy}`);
      const { data, count } = await response.json();

      setCollections(data);
      setTotalCollections(count);
    };

    fetchCollections();
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

  const columns = [
    {
      id: 'name',
      label: 'Collection Name',
    },
    {
      id: 'description',
      label: 'Description',
    },
  ];

  const handleRowClick = (collection: {name: string, description: string}) => {
    setFormData(collection);
    setIsOpen(true);
  }

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4" >Collections</Typography>
        <Button onClick={() => setIsOpen(true)} variant="contained">New Collection</Button>
      </Box>
      <Paper sx={{ overflow: 'hidden', flex: 1, margin: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {columns.map((column, idx) => (
                  <TableCell key={idx}>
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {collections.map((collection, idx) => (
                <TableRow hover key={idx} sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(collection)}>
                  {columns.map((column, idx) => (
                    <TableCell key={idx}>{collection[column.id]}</TableCell>
                  ))}
                </TableRow>
              ))}
              {collections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>No Collections Found</Typography>
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
          count={totalCollections}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[100, 250, 500]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <CollectionDialogForm isOpen={isOpen} setIsOpen={setIsOpen} form={formData} />
    </>
  );
}