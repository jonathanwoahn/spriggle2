'use client';
import { Box, Button, Checkbox, CircularProgress, Input, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import { IBookData } from "@/lib/cashmere";
import { useRouter } from "next/navigation";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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


  /**
   * NOTE TO SELF
   * Next step, I want to modify the 'audio_metadata' table to be 'block_metadata', and then include a type column to record the block type
   * This will allow me to generate metadata for each type of block. For instance, for sections, I can create section summaries, record how long the section is, etc.
   * For book blocks, I can store the full length of the book, i can generate a brief summary of the book, etc. 
   * I should generate the summaries in markdown, and render the markdown on the frontend
   * I want to use the summaries to generate embeddings, that i can then use to not only search for books, but provide lists of "similar books"
   * I should also generate the legal pages in markdown and render them on the front end so I don't have to format them manually
   */
  

  const ACTIONS = [
    {
      value: 'generate_jobs',
      label: 'Generate Jobs',
    },
    // {
    //   value: 'process_jobs',
    //   label: 'Process Jobs',
    // },
    {
      value: 'process_block_metadata',
      label: 'Process Text Block Metadata',
    },
    {
      value: 'combine_audio_chunks',
      label: 'Combine Audio Chunks',
    },
    {
      value: 'generate_book_summary',
      label: 'Generate Book Summary',
    },
    // {
    //   value: 'generate_book_overview',
    //   label: 'Generate Book Overview',
    // },
    {
      value: 'generate_embedding',
      label: 'Generate Embedding',
    },
  ];

  const generateJobs = async (ids: string[]) => {
    setIsProcessing(true);
    for(let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/book/${ids[i]}/tts`, { method: 'POST' });
      }catch(e) {
        console.error(e);
      } finally {
        console.log(`Jobs generated for book ${ids[i]}`);
      }
    }

    setIsProcessing(false);
  }
  
  const processTextBlockMetadata = async (ids: string[]) => {
    setIsProcessing(true);
    for (let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/audio/${ids[i]}/utility/process-block-metadata`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`Jobs generated for book ${ids[i]}`);
      }
    }

    setIsProcessing(false);
  }

  const combineAudioChunks = async (ids: string[]) => {
    setIsProcessing(true);
    for (let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/audio/${ids[i]}/utility/combine-audio-chunks`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`Jobs generated for book ${ids[i]}`);
      }
    }

    setIsProcessing(false);
  }

  const generateBookSummary = async (ids: string[]) => {
    setIsProcessing(true);
    for (let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/audio/${ids[i]}/utility/generate-book-summary`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`Jobs generated for book ${ids[i]}`);
      }
    }

    setIsProcessing(false);
  }

  const generateEmbeddings = async (ids: string[]) => {
    setIsProcessing(true);
    for (let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/audio/${ids[i]}/utility/generate-embedding`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`Jobs generated for book ${ids[i]}`);
      }
    }

    setIsProcessing(false);
  }
  
  const handleMenuClick = (action: string) => {
    handleClose();

    if(selected.length === 0) {
      return;
    }
    
    switch(action) {
      case 'generate_jobs':
        generateJobs(selected);
        break;
      case 'process_block_metadata':
        processTextBlockMetadata(selected);
        break;
      case 'combine_audio_chunks':
        combineAudioChunks(selected);
        break;
      case 'generate_book_summary':
        generateBookSummary(selected);
        break;
      case 'generate_embedding':
        generateEmbeddings(selected);
        break;
    }

    setSelected([]);
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
    </>
  );
}