'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';

interface DatabaseStepProps {
  onComplete: () => void;
}

export default function DatabaseStep({ onComplete }: DatabaseStepProps) {
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setStatus('Pushing database schema...');

    try {
      // First, push the schema to create tables
      const pushResponse = await fetch('/api/setup/push-schema', {
        method: 'POST',
      });

      if (!pushResponse.ok) {
        const pushData = await pushResponse.json();
        throw new Error(pushData.error || 'Failed to push database schema');
      }

      setStatus('Verifying connection...');

      // Then complete the database step
      const response = await fetch('/api/setup/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'database' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to database');
      }

      setStatus('');
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <StorageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Database Connection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We&apos;ll verify your database connection is working properly.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This will create the necessary database tables and verify the connection.
        </Typography>
      </Alert>

      {testing && status && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {status}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 3 }}
        >
          Database schema created and connection verified!
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={testConnection}
        disabled={testing || success}
        sx={{ py: 1.5 }}
      >
        {testing ? (
          <CircularProgress size={24} color="inherit" />
        ) : success ? (
          'Connected!'
        ) : (
          'Initialize Database'
        )}
      </Button>
    </Box>
  );
}
