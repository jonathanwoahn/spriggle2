'use client';
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogContent, DialogTitle, Input, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { format, set } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from "next/navigation";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { IBookData } from "@/lib/types";
import BookCollectionsDialog from "./book-collections-dialog";

export default function BooksTable() {
  const router = useRouter();
  
  const [books, setBooks] = useState<IBookData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalBooks, setTotalBooks] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {

      try {
        const response = await fetch(`/api/books?limit=${rowsPerPage}&offset=${page * rowsPerPage}&search=${search}&collection=3`);
        
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

  const handleSelectClick = (bookId: string) => {
    const uuid = books.find((book) => book.uuid === bookId)?.uuid;
    if (!uuid) {
      return;
    }

    const selectedIndex = selected.indexOf(uuid);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = books.map((n) => n.uuid);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }
  const handleClose = () => {
    setAnchorEl(null);
  }

  const ACTIONS = [
    {
      value: 'add_to_collections',
      label: 'Add to Collections',
      // action: () => setShowCollections(true),
    },
    {
      value: 'generate_jobs',
      label: 'Generate Jobs',
    },
  ];

  const generateJobs = async () => {
    setIsProcessing(true);

    try {

      for(let id of selected) {
        const response = await fetch(`/api/book/${id}/generate-jobs`, {method: 'POST'});
        
        if(!response.ok) {
          console.error(response);
          return;
        }
      }

    }catch(e) {
      console.log(e);
    } finally {
      setIsProcessing(false);
      setSelected([]);
    }
  }
  
  const handleMenuClick = (action: string) => {
    handleClose();

    if(selected.length === 0) {
      return;
    }
    
    switch(action) {
      case 'add_to_collections':
        setShowCollections(true);
        break;
      case 'generate_jobs':
        generateJobs()
        break;
    }

    // setSelected([]);
  }
  
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4" >Books</Typography>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
          {isProcessing && <Typography variant="body1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <CircularProgress size={20} />
            Processing
          </Typography>}
          <Button
            disabled={isProcessing || selected.length === 0}
            variant="contained"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleButtonClick}>Bulk Actions ({selected.length})</Button>

        </Box>
        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          {ACTIONS.map((action, idx) => (
            <MenuItem key={action.value} onClick={() => handleMenuClick(action.value)}>({idx + 1}) {action.label}</MenuItem>
          ))}
        </Menu>
      </Box>
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
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={books.length > 0 && selected.length === books.length}
                    indeterminate={selected.length > 0 && selected.length < books.length}
                    onChange={handleSelectAllClick}
                    color="primary"
                  />
                </TableCell>
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      onChange={() => handleSelectClick(book.uuid)}
                      checked={selected.indexOf(book.uuid) !== -1}
                      color="primary"
                    />
                  </TableCell>
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
      <BookCollectionsDialog isOpen={showCollections} setIsOpen={setShowCollections} bookIds={selected} />
    </>
  );
}