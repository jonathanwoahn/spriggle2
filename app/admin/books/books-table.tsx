'use client';
import { Box, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import { IBookData } from "@/lib/cashmere";
import { useRouter } from "next/navigation";

export default function BooksTable() {
  const router = useRouter();

  
  const [books, setBooks] = useState<IBookData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalBooks, setTotalBooks] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [search, setSearch] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {

      try {
        const response = await fetch(`/api/books?limit=${rowsPerPage}&offset=${page * rowsPerPage}&search=${search}`);
        const {items, count, error} = await response.json();
  
        if(error) {
          console.error(error);
          return;
        }
  
        setBooks(items);
        setTotalBooks(count);

      }catch(e) {
        console.log(e);
      }
    };

    fetchBooks();
  }, [page, rowsPerPage, order, orderBy, search]);

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
      id: 'title',
      label: 'Title',
      href: ``,
      onClick: (row: IBookData) => {
        router.push(`/book/${row.uuid}`);
      }
    },
    {
      id: 'subtitle',
      label: 'Subtitle',
    },
    {
      id: 'creators',
      label: 'Creators',
      render: (val: string[]) => Array.isArray(val) ? val.join(', ') : val,
    },
    {
      id: 'publisher',
      label: 'Publisher',
    },
    {
      id: 'creation_date',
      label: 'Created',
      render: (val: string) => format(new Date(val), 'yyyy-MM-dd'),
    },
  ];

  const handleRowClick = (book: IBookData) => {

  }

  return (
    <>
      <Paper sx={{ overflow: 'hidden', flex: 1, margin: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Input
          startAdornment={<SearchIcon />}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ margin: 2, width: '100%' }}
        />

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
              {books.map((book, idx) => (
                <TableRow hover key={idx} sx={{ cursor: 'pointer' }}>
                  {columns.map((column, index) => (
                    <TableCell
                      onClick={column.onClick ? () => column.onClick(book) : undefined}
                      key={index}>{column.render ? column.render((book.data as Record<string, any>)[column.id]) : (book.data as Record<string, any>)[column.id]}</TableCell>
                  ))}
                  
                </TableRow>
              ))}
              {books.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>No books found</Typography>
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
          count={totalBooks}
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