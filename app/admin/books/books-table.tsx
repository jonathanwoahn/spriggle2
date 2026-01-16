'use client';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from "next/navigation";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BookCollectionsDialog from "./book-collections-dialog";

interface IngestedBook {
  id: number;
  bookId: string;
  blockId: string;
  title: string;
  subtitle: string | null;
  creators: string[];
  publisher: string | null;
  coverImage: string | null;
  duration: number;
  ready: boolean;
  summary: string | null;
  coverColors: any;
  createdAt: string;
  ingestion: {
    status: string;
    totalSections: number | null;
    completedSections: number | null;
    error: string | null;
    startedAt: string | null;
    completedAt: string | null;
    progress: number;
  } | null;
}

function formatDuration(ms: number): string {
  if (!ms || ms === 0) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function BooksTable() {
  const router = useRouter();

  const [books, setBooks] = useState<IngestedBook[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalBooks, setTotalBooks] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('createdAt');
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // Single book or null for bulk
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const searchQuery = search.trim() ? `&search=${encodeURIComponent(search)}` : '';
        const response = await fetch(`/api/ingested-books?limit=${rowsPerPage}&offset=${page * rowsPerPage}${searchQuery}`);

        const data = await response.json();

        if (data.error) {
          setFetchError(data.error);
          setBooks([]);
          setTotalBooks(0);
          return;
        }

        setBooks(data.items || []);
        setTotalBooks(data.count || 0);

      } catch (e) {
        console.error('Failed to fetch books:', e);
        setFetchError('Failed to connect to server. Please try again.');
      } finally {
        setIsLoading(false);
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

  const handleSelectClick = (bookId: string) => {
    const selectedIndex = selected.indexOf(bookId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, bookId);
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
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = books.map((n) => n.bookId);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const ACTIONS = [
    {
      value: 'add_to_collections',
      label: 'Add to Collections',
    },
    {
      value: 'generate_jobs',
      label: 'Re-generate Jobs',
    },
    {
      value: 'delete',
      label: 'Delete Selected',
      color: 'error',
    },
  ];

  const generateJobs = async () => {
    setIsProcessing(true);

    try {
      for (let id of selected) {
        const response = await fetch(`/api/book/${id}/generate-jobs`, { method: 'POST' });

        if (!response.ok) {
          console.error(response);
          return;
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsProcessing(false);
      setSelected([]);
    }
  };

  const handleDeleteClick = (bookId?: string) => {
    if (bookId) {
      setDeleteTarget(bookId);
    } else {
      setDeleteTarget(null);
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setIsProcessing(true);

    const booksToDelete = deleteTarget ? [deleteTarget] : selected;
    setDeleteProgress({ current: 0, total: booksToDelete.length });

    try {
      for (let i = 0; i < booksToDelete.length; i++) {
        const id = booksToDelete[i];
        setDeleteProgress({ current: i + 1, total: booksToDelete.length });

        const response = await fetch(`/api/book/${id}/delete`, { method: 'DELETE' });

        if (!response.ok) {
          const data = await response.json();
          console.error(`Failed to delete ${id}:`, data.error || response.statusText);
        }
      }

      // Refresh the list
      setPage(0);
      setSelected([]);
    } catch (e) {
      console.error('Delete operation failed:', e);
    } finally {
      setIsProcessing(false);
      setDeleteProgress(null);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleMenuClick = (action: string) => {
    handleClose();

    if (selected.length === 0) {
      return;
    }

    switch (action) {
      case 'add_to_collections':
        setShowCollections(true);
        break;
      case 'generate_jobs':
        generateJobs();
        break;
      case 'delete':
        handleDeleteClick();
        break;
    }
  };

  const getStatusChip = (book: IngestedBook) => {
    if (book.ready) {
      return <Chip label="Ready" size="small" color="success" />;
    }
    if (book.ingestion) {
      switch (book.ingestion.status) {
        case 'in_progress':
          return <Chip label={`In Progress (${book.ingestion.progress}%)`} size="small" color="info" />;
        case 'completed':
          return <Chip label="Processing Complete" size="small" color="success" />;
        case 'failed':
          return <Chip label="Failed" size="small" color="error" />;
        case 'pending':
          return <Chip label="Pending" size="small" color="warning" />;
        default:
          return <Chip label={book.ingestion.status} size="small" />;
      }
    }
    return <Chip label="Unknown" size="small" variant="outlined" />;
  };

  return (
    <>
      {/* Action Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Input
          placeholder="Search ingested books..."
          startAdornment={<SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 300,
            bgcolor: '#f8f9fc',
            px: 2,
            py: 1,
            borderRadius: 2,
            '&:before, &:after': { display: 'none' },
          }}
          disableUnderline
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
          {isProcessing && (
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#9966FF',
              }}
            >
              <CircularProgress size={18} sx={{ color: '#9966FF' }} />
              Processing...
            </Typography>
          )}
          <Button
            disabled={isProcessing || selected.length === 0}
            variant="contained"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleButtonClick}
            sx={{
              bgcolor: '#9966FF',
              '&:hover': { bgcolor: '#7A52CC' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Bulk Actions ({selected.length})
          </Button>
        </Box>
        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                mt: 1,
              },
            },
          }}
        >
          {ACTIONS.map((action) => (
            <MenuItem
              key={action.value}
              onClick={() => handleMenuClick(action.value)}
              sx={{
                py: 1.5,
                px: 2.5,
                color: action.color === 'error' ? 'error.main' : 'inherit',
                '&:hover': {
                  bgcolor: action.color === 'error'
                    ? 'rgba(211, 47, 47, 0.08)'
                    : 'rgba(153, 102, 255, 0.08)',
                },
              }}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Table */}
      <Paper
        sx={{
          overflow: 'hidden',
          flex: 1,
          m: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                  }}
                >
                  <Checkbox
                    checked={books.length > 0 && selected.length === books.length}
                    indeterminate={selected.length > 0 && selected.length < books.length}
                    onChange={handleSelectAllClick}
                    sx={{
                      color: 'rgba(153, 102, 255, 0.5)',
                      '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                        color: '#9966FF',
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                    fontWeight: 600,
                    color: '#1a1a2e',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleRequestSort('title')}
                    sx={{
                      '&.Mui-active': { color: '#9966FF' },
                      '& .MuiTableSortLabel-icon': { color: '#9966FF !important' },
                    }}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                    fontWeight: 600,
                    color: '#1a1a2e',
                  }}
                >
                  Creators
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    width: 150,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    width: 100,
                  }}
                >
                  Duration
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8f9fc',
                    borderBottom: '2px solid rgba(153, 102, 255, 0.2)',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    width: 60,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#9966FF' }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Loading ingested books...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && fetchError && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mx: 'auto', maxWidth: 600 }}>
                      {fetchError}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !fetchError && books.map((book) => (
                <TableRow
                  hover
                  key={book.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(153, 102, 255, 0.04)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(153, 102, 255, 0.08)',
                    },
                  }}
                  selected={selected.indexOf(book.bookId) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      onChange={() => handleSelectClick(book.bookId)}
                      checked={selected.indexOf(book.bookId) !== -1}
                      sx={{
                        color: 'rgba(153, 102, 255, 0.5)',
                        '&.Mui-checked': {
                          color: '#9966FF',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => router.push(`/book/${book.bookId}`)}
                    sx={{
                      color: '#9966FF',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {book.title}
                    </Typography>
                    {book.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {book.subtitle}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {book.creators?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(book)}
                  </TableCell>
                  <TableCell>
                    {formatDuration(book.duration)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete book">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(book.bookId);
                        }}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                            bgcolor: 'rgba(211, 47, 47, 0.08)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && !fetchError && books.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      No ingested books found. Go to Catalog to ingest books.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'end',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'white',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          px: 2,
        }}
      >
        <TablePagination
          component="div"
          count={totalBooks}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[100, 250, 500]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-selectIcon': {
              color: '#9966FF',
            },
            '& .MuiIconButton-root': {
              color: '#9966FF',
              '&.Mui-disabled': {
                color: 'rgba(153, 102, 255, 0.3)',
              },
            },
          }}
        />
      </Box>
      <BookCollectionsDialog isOpen={showCollections} setIsOpen={setShowCollections} bookIds={selected} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget ? (
              <>
                Are you sure you want to delete this book? This will permanently remove:
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{selected.length}</strong> book(s)?
                This will permanently remove:
              </>
            )}
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2, color: 'text.secondary' }}>
            <li>All audio files from storage</li>
            <li>All block timestamps and metadata</li>
            <li>Voice configurations</li>
            <li>Collection memberships</li>
            <li>License usage records</li>
            <li>Ingestion status and history</li>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The book(s) will need to be re-ingested
            from the catalog to restore.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isProcessing}
          >
            {isProcessing && deleteProgress
              ? `Deleting ${deleteProgress.current}/${deleteProgress.total}...`
              : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
