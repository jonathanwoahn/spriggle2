'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ApiKeysStepProps {
  onComplete: () => void;
}

export default function ApiKeysStep({ onComplete }: ApiKeysStepProps) {
  const [cashmereApiKey, setCashmereApiKey] = useState('');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cashmereApiKey) {
      setError('Cashmere API Key is required');
      return;
    }

    if (!elevenLabsApiKey) {
      setError('ElevenLabs API Key is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/setup/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'api_keys',
          data: {
            cashmereApiKey,
            elevenLabsApiKey,
            openAiApiKey,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API keys');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <KeyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          API Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your API keys for the external services.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Cashmere API Key"
          type="password"
          fullWidth
          required
          value={cashmereApiKey}
          onChange={(e) => setCashmereApiKey(e.target.value)}
          sx={{ mb: 2 }}
          helperText={
            <span>
              Get your key from{' '}
              <Link href="https://omnibk.ai" target="_blank" rel="noopener">
                omnibk.ai
              </Link>
            </span>
          }
        />

        <TextField
          label="ElevenLabs API Key"
          type="password"
          fullWidth
          required
          value={elevenLabsApiKey}
          onChange={(e) => setElevenLabsApiKey(e.target.value)}
          sx={{ mb: 2 }}
          helperText={
            <span>
              Get your key from{' '}
              <Link href="https://elevenlabs.io" target="_blank" rel="noopener">
                elevenlabs.io
              </Link>
            </span>
          }
        />

        <Accordion sx={{ mb: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              Optional: OpenAI API Key (for summaries & embeddings)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="OpenAI API Key"
              type="password"
              fullWidth
              value={openAiApiKey}
              onChange={(e) => setOpenAiApiKey(e.target.value)}
              helperText={
                <span>
                  Get your key from{' '}
                  <Link href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">
                    platform.openai.com
                  </Link>
                </span>
              }
            />
          </AccordionDetails>
        </Accordion>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Save API Keys'
          )}
        </Button>
      </form>
    </Box>
  );
}
