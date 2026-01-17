'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AdminPageHeader from '@/components/admin-page-header';
import { format, formatDistanceToNow } from 'date-fns';

interface TriggerRun {
  id: string;
  status: string;
  taskIdentifier: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  isCompleted: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  isExecuting: boolean;
  isCancelled: boolean;
  error?: { message: string };
}

interface IngestionStatus {
  id: number;
  bookId: string;
  status: string;
  totalSections: number | null;
  completedSections: number | null;
  error: string | null;
  triggerRunId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  triggerRun: TriggerRun | null;
}

export default function IngestionsPage() {
  const [statuses, setStatuses] = useState<IngestionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/trigger/runs');
      if (!response.ok) throw new Error('Failed to fetch ingestion statuses');

      const data = await response.json();
      setStatuses(data.statuses || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Auto-refresh every 5 seconds if there are active tasks
  useEffect(() => {
    if (!autoRefresh) return;

    const hasActiveTask = statuses.some(
      s => s.status === 'in_progress' || s.status === 'pending' || s.triggerRun?.isExecuting
    );

    if (hasActiveTask) {
      const interval = setInterval(fetchStatuses, 5000);
      return () => clearInterval(interval);
    }
  }, [statuses, autoRefresh, fetchStatuses]);

  const getStatusChip = (status: IngestionStatus) => {
    const triggerStatus = status.triggerRun?.status;

    // Prioritize trigger run status if available
    if (status.triggerRun) {
      if (status.triggerRun.isExecuting) {
        return <Chip label="Executing" color="info" size="small" />;
      }
      if (status.triggerRun.isSuccess) {
        return <Chip label="Success" color="success" size="small" />;
      }
      if (status.triggerRun.isFailed) {
        return <Chip label="Failed" color="error" size="small" />;
      }
      if (status.triggerRun.isCancelled) {
        return <Chip label="Cancelled" color="warning" size="small" />;
      }
      return <Chip label={triggerStatus || 'Unknown'} size="small" />;
    }

    // Fall back to our status
    switch (status.status) {
      case 'pending':
        return <Chip label="Pending" color="default" size="small" />;
      case 'in_progress':
        return <Chip label="In Progress" color="info" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status.status} size="small" />;
    }
  };

  const getProgress = (status: IngestionStatus) => {
    if (!status.totalSections) return null;
    const progress = ((status.completedSections || 0) / status.totalSections) * 100;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          {status.completedSections}/{status.totalSections}
        </Typography>
      </Box>
    );
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '-';
    }
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, width: '100%', flexDirection: 'column' }}>
      <AdminPageHeader
        title="Ingestions"
        subtitle="Monitor book ingestion pipeline"
        icon={<CloudSyncIcon />}
        breadcrumbs={[{ label: 'Ingestions' }]}
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStatuses} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : statuses.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No ingestions found. Go to the Catalog page to start ingesting books.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Trigger Run</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {status.bookId.substring(0, 12)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(status)}</TableCell>
                    <TableCell>{getProgress(status) || '-'}</TableCell>
                    <TableCell>
                      {status.triggerRunId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {status.triggerRunId.substring(0, 8)}...
                          </Typography>
                          <Tooltip title="View in Trigger.dev">
                            <IconButton
                              size="small"
                              href={`https://cloud.trigger.dev/runs/${status.triggerRunId}`}
                              target="_blank"
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatTime(status.startedAt || status.triggerRun?.startedAt || null)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatTime(status.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(status.error || status.triggerRun?.error) && (
                        <Tooltip title={status.error || status.triggerRun?.error?.message || ''}>
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {status.error || status.triggerRun?.error?.message}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
