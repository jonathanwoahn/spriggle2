'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckIcon from '@mui/icons-material/Check';
import AdminPageHeader from '@/components/admin-page-header';
import { getModelsForProvider, getDefaultModel, type TTSModel, type ModelInfo, type TTSProvider } from '@/lib/tts-models';

interface Book {
  uuid: string;
  cover_image: string;
  data: {
    title: string;
    subtitle?: string;
    authors?: string[];
    creators?: string[];
    publisher?: string;
  };
}

interface IngestionStatus {
  bookId: string;
  status: string;
  progress: number;
}

interface Voice {
  voice_id?: string;  // From ElevenLabs API directly
  voiceId?: string;   // From database
  name: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
  previewUrl?: string;
  provider?: TTSProvider;
}

interface SectionPreview {
  order: number;
  label: string;
  matter?: string;
  isBody: boolean;
  blockCount?: number;
}

interface BookSections {
  bookId: string;
  bookTitle: string;
  sections: SectionPreview[];
  selectedSections: number[];
}

// Helper to get voice ID regardless of source
const getVoiceId = (voice: Voice): string => voice.voiceId || voice.voice_id || '';
const getPreviewUrl = (voice: Voice): string => voice.previewUrl || voice.preview_url || '';

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [ingestionStatuses, setIngestionStatuses] = useState<Map<string, IngestionStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ingestDialogOpen, setIngestDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<TTSProvider>('openai');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(getModelsForProvider('openai'));
  const [selectedModel, setSelectedModel] = useState<TTSModel>(getDefaultModel('openai'));
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [resettingBook, setResettingBook] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Section preview state
  const [dialogStep, setDialogStep] = useState<'voice' | 'sections'>('voice');
  const [bookSections, setBookSections] = useState<BookSections[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search,
        limit: '20',
        offset: String((page - 1) * 20),
      });

      const response = await fetch(`/api/catalog?${params}`);
      if (!response.ok) throw new Error('Failed to fetch catalog');

      const data = await response.json();
      setBooks(data.items || []);
      setTotalPages(Math.ceil((data.count || 0) / 20));

      // Update ingestion statuses from the response
      const statusMap = new Map<string, IngestionStatus>();
      for (const item of data.items || []) {
        if (item.ingestionStatus) {
          statusMap.set(item.uuid, {
            bookId: item.uuid,
            status: item.ingestionStatus.status,
            progress: item.ingestionStatus.totalSections
              ? Math.round((item.ingestionStatus.completedSections || 0) / item.ingestionStatus.totalSections * 100)
              : 0,
          });
        }
      }
      setIngestionStatuses(statusMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const fetchIngestionStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/ingest/status');
      if (!response.ok) return;

      const data = await response.json();
      const statusMap = new Map<string, IngestionStatus>();
      for (const status of data.statuses || []) {
        statusMap.set(status.bookId, status);
      }
      setIngestionStatuses(statusMap);
    } catch {
      // Silently fail - statuses are optional
    }
  }, []);

  const fetchVoices = useCallback(async (provider: TTSProvider, model?: TTSModel) => {
    setLoadingVoices(true);
    setVoices([]);
    setSelectedVoice('');

    try {
      // For OpenAI, pass model to filter voices by compatibility
      const modelParam = provider === 'openai' && model ? `&model=${model}` : '';
      const response = await fetch(`/api/voices?provider=${provider}${modelParam}`);
      if (!response.ok) return;

      const data = await response.json();
      const voicesList = data.voices || [];
      setVoices(voicesList);
      if (voicesList.length > 0) {
        setSelectedVoice(getVoiceId(voicesList[0]));
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingVoices(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchIngestionStatuses();
  }, [fetchBooks, fetchIngestionStatuses]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(books.map(b => b.uuid));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (bookId: string) => {
    setSelected(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const fetchSectionsForBooks = useCallback(async () => {
    setLoadingSections(true);
    const sectionsData: BookSections[] = [];

    for (const bookId of selected) {
      try {
        const response = await fetch(`/api/book/${bookId}/sections?includeBlockCounts=true`);
        if (response.ok) {
          const data = await response.json();
          // Pre-select body sections by default
          const bodySections = data.sections
            .filter((s: SectionPreview) => s.isBody)
            .map((s: SectionPreview) => s.order);

          sectionsData.push({
            bookId,
            bookTitle: data.bookTitle || bookId,
            sections: data.sections || [],
            selectedSections: bodySections.length > 0 ? bodySections : data.sections.map((s: SectionPreview) => s.order),
          });
        }
      } catch {
        // If fetching fails for a book, skip it
      }
    }

    setBookSections(sectionsData);
    setLoadingSections(false);
  }, [selected]);

  const handleOpenIngestDialog = () => {
    if (selected.length === 0) return;
    const defaultModel = getDefaultModel(selectedProvider);
    setSelectedModel(defaultModel);
    setAvailableModels(getModelsForProvider(selectedProvider));
    fetchVoices(selectedProvider, defaultModel);
    setDialogStep('voice');
    setBookSections([]);
    setIngestDialogOpen(true);
  };

  const handleNextStep = () => {
    if (dialogStep === 'voice') {
      if (!selectedVoice) return;
      setDialogStep('sections');
      fetchSectionsForBooks();
    }
  };

  const handlePreviousStep = () => {
    if (dialogStep === 'sections') {
      setDialogStep('voice');
    }
  };

  const toggleSectionSelection = (bookId: string, sectionOrder: number) => {
    setBookSections(prev => prev.map(bs => {
      if (bs.bookId !== bookId) return bs;
      const isSelected = bs.selectedSections.includes(sectionOrder);
      return {
        ...bs,
        selectedSections: isSelected
          ? bs.selectedSections.filter(o => o !== sectionOrder)
          : [...bs.selectedSections, sectionOrder],
      };
    }));
  };

  const toggleAllSections = (bookId: string, selectAll: boolean) => {
    setBookSections(prev => prev.map(bs => {
      if (bs.bookId !== bookId) return bs;
      return {
        ...bs,
        selectedSections: selectAll ? bs.sections.map(s => s.order) : [],
      };
    }));
  };

  const handleProviderChange = (provider: TTSProvider) => {
    setSelectedProvider(provider);
    const models = getModelsForProvider(provider);
    const defaultModel = getDefaultModel(provider);
    setAvailableModels(models);
    setSelectedModel(defaultModel);
    fetchVoices(provider, defaultModel);
  };

  const handleModelChange = (model: TTSModel) => {
    setSelectedModel(model);
    // For OpenAI, re-fetch voices filtered by the new model
    if (selectedProvider === 'openai') {
      fetchVoices(selectedProvider, model);
    }
  };

  const handleStartIngestion = async () => {
    if (!selectedVoice || selected.length === 0) return;

    setIngesting(true);
    try {
      const selectedVoiceData = voices.find(v => getVoiceId(v) === selectedVoice);

      // Build selectedSections map from bookSections state
      const selectedSectionsMap: Record<string, number[]> = {};
      for (const bs of bookSections) {
        if (bs.selectedSections.length > 0) {
          selectedSectionsMap[bs.bookId] = bs.selectedSections;
        }
      }

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookIds: selected,
          voiceId: selectedVoice,
          voiceName: selectedVoiceData?.name,
          provider: selectedProvider,
          model: selectedModel,
          selectedSections: Object.keys(selectedSectionsMap).length > 0 ? selectedSectionsMap : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to start ingestion');

      setIngestDialogOpen(false);
      setSelected([]);
      setDialogStep('voice');
      setBookSections([]);
      await fetchIngestionStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start ingestion');
    } finally {
      setIngesting(false);
    }
  };

  const handlePlayPreview = (voice: Voice) => {
    const voiceId = getVoiceId(voice);
    const previewUrl = getPreviewUrl(voice);

    if (!previewUrl) return;

    // If this voice is already playing, stop it
    if (playingVoice === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Play the new voice preview
    const audio = new Audio(previewUrl);
    audio.onended = () => setPlayingVoice(null);
    audio.onerror = () => setPlayingVoice(null);
    audio.play();
    audioRef.current = audio;
    setPlayingVoice(voiceId);
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoice(null);
  };

  const handleResetIngestion = async (bookId: string) => {
    if (resettingBook) return; // Already resetting something

    setResettingBook(bookId);
    try {
      const response = await fetch(`/api/ingest/${bookId}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset ingestion');
      }

      // Refresh the statuses
      await fetchBooks();
      await fetchIngestionStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset ingestion');
    } finally {
      setResettingBook(null);
    }
  };

  const getStatusChip = (bookId: string) => {
    const status = ingestionStatuses.get(bookId);
    if (!status) {
      return <Chip label="Not Ingested" size="small" variant="outlined" />;
    }

    switch (status.status) {
      case 'in_progress':
        return (
          <Chip
            label={`In Progress (${status.progress}%)`}
            size="small"
            color="info"
          />
        );
      case 'completed':
        return <Chip label="Complete" size="small" color="success" />;
      case 'failed':
        return <Chip label="Failed" size="small" color="error" />;
      case 'pending':
        return <Chip label="Pending" size="small" color="warning" />;
      default:
        return <Chip label={status.status} size="small" />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
      }}
    >
      <AdminPageHeader
        title="Catalog"
        subtitle="Browse and ingest books from Cashmere"
        icon={<MenuBookIcon />}
        breadcrumbs={[{ label: 'Catalog' }]}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchBooks();
                fetchIngestionStatuses();
              }}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled={selected.length === 0}
              onClick={handleOpenIngestDialog}
              sx={{
                bgcolor: 'white',
                color: '#9966FF',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              Ingest Selected ({selected.length})
            </Button>
          </Stack>
        }
      />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search books..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === books.length && books.length > 0}
                  indeterminate={selected.length > 0 && selected.length < books.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow
                  key={book.uuid}
                  hover
                  selected={selected.includes(book.uuid)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(book.uuid)}
                      onChange={() => handleSelect(book.uuid)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {book.data.title}
                    </Typography>
                    {book.data.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {book.data.subtitle}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {(book.data.creators || book.data.authors)?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    {book.data.publisher || '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusChip(book.uuid)}
                      {ingestionStatuses.get(book.uuid) &&
                       ['failed', 'in_progress', 'pending'].includes(ingestionStatuses.get(book.uuid)!.status) && (
                        <IconButton
                          size="small"
                          onClick={() => handleResetIngestion(book.uuid)}
                          disabled={resettingBook === book.uuid}
                          title="Reset ingestion"
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'warning.main' }
                          }}
                        >
                          {resettingBook === book.uuid ? (
                            <CircularProgress size={16} />
                          ) : (
                            <RestartAltIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      </Box>

      <Dialog
        open={ingestDialogOpen}
        onClose={() => { stopPreview(); setIngestDialogOpen(false); setDialogStep('voice'); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogStep === 'voice' ? 'Step 1: Select Voice' : 'Step 2: Review Sections'}
        </DialogTitle>
        <DialogContent>
          {dialogStep === 'voice' ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You are about to ingest {selected.length} book(s). Select a TTS provider and voice.
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="provider-select-label">TTS Provider</InputLabel>
                <Select
                  labelId="provider-select-label"
                  value={selectedProvider}
                  label="TTS Provider"
                  onChange={(e) => handleProviderChange(e.target.value as TTSProvider)}
                >
                  <MenuItem value="openai">OpenAI TTS</MenuItem>
                  <MenuItem value="elevenlabs">ElevenLabs</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="model-select-label">Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Model"
                  onChange={(e) => handleModelChange(e.target.value as TTSModel)}
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Voice
              </Typography>
              {selectedProvider === 'elevenlabs' && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Click the play button to preview a voice before selecting.
                </Typography>
              )}

              {loadingVoices ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
              <List sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {voices.map((voice) => {
                  const voiceId = getVoiceId(voice);
                  const isSelected = selectedVoice === voiceId;
                  const isPlaying = playingVoice === voiceId;
                  const previewUrl = getPreviewUrl(voice);

                  return (
                    <ListItem
                      key={voiceId}
                      disablePadding
                      secondaryAction={
                        previewUrl && (
                          <IconButton
                            edge="end"
                            onClick={(e) => { e.stopPropagation(); handlePlayPreview(voice); }}
                            sx={{
                              color: isPlaying ? 'error.main' : 'primary.main',
                            }}
                          >
                            {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
                          </IconButton>
                        )
                      }
                    >
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => setSelectedVoice(voiceId)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {isSelected && <CheckIcon color="primary" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={voice.name}
                          secondary={
                            voice.description ||
                            (voice.labels?.accent || voice.labels?.gender
                              ? [voice.labels?.gender, voice.labels?.accent, voice.labels?.age]
                                  .filter(Boolean)
                                  .join(' • ')
                              : null)
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review and select which sections to include in the audiobook. By default, only body content is selected.
              </Typography>

              {loadingSections ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Loading sections...
                  </Typography>
                </Box>
              ) : bookSections.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Could not load section preview. You can still start ingestion - the system will automatically detect and process body content sections.
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {bookSections.map((bs) => (
                    <Paper key={bs.bookId} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {bs.bookTitle}
                        </Typography>
                        <Box>
                          <Button
                            size="small"
                            onClick={() => toggleAllSections(bs.bookId, true)}
                            sx={{ mr: 1 }}
                          >
                            Select All
                          </Button>
                          <Button
                            size="small"
                            onClick={() => toggleAllSections(bs.bookId, false)}
                          >
                            Clear
                          </Button>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {bs.selectedSections.length} of {bs.sections.length} sections selected
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        {bs.sections.map((section) => {
                          const isSelected = bs.selectedSections.includes(section.order);
                          return (
                            <Box
                              key={section.order}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' },
                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => toggleSectionSelection(bs.bookId, section.order)}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                  {section.order + 1}. {section.label}
                                </Typography>
                              </Box>
                              {section.blockCount !== undefined && section.blockCount > 0 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 1, whiteSpace: 'nowrap' }}
                                >
                                  {section.blockCount} block{section.blockCount !== 1 ? 's' : ''}
                                </Typography>
                              )}
                              {section.matter && section.matter !== 'body' && section.matter !== 'bodymatter' && (
                                <Chip
                                  label={section.matter}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { stopPreview(); setIngestDialogOpen(false); setDialogStep('voice'); }}>
            Cancel
          </Button>
          {dialogStep === 'sections' && (
            <Button onClick={handlePreviousStep}>
              Back
            </Button>
          )}
          {dialogStep === 'voice' ? (
            <Button
              variant="contained"
              onClick={() => { stopPreview(); handleNextStep(); }}
              disabled={!selectedVoice}
            >
              Next: Review Sections
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => { stopPreview(); handleStartIngestion(); }}
              disabled={ingesting || loadingSections || (bookSections.length > 0 && bookSections.every(bs => bs.selectedSections.length === 0))}
            >
              {ingesting ? <CircularProgress size={24} /> : (
                bookSections.length === 0 ? 'Start Ingestion (Auto-detect Sections)' : 'Start Ingestion'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
