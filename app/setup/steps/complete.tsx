'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CelebrationIcon from '@mui/icons-material/Celebration';

interface CompleteStepProps {
  onComplete: () => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/setup/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'complete' }),
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to complete setup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <CelebrationIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Setup Complete!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your audiobook platform is ready to use.
        </Typography>
      </Box>

      <List sx={{ mb: 3 }}>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Database Connected"
            secondary="Your database is configured and ready"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Admin Account Created"
            secondary="You can sign in with your credentials"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="API Keys Configured"
            secondary="External services are connected"
          />
        </ListItem>
      </List>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Click below to finish setup and go to the admin dashboard.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleComplete}
        disabled={loading}
        sx={{ py: 1.5 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Go to Admin Dashboard'
        )}
      </Button>
    </Box>
  );
}
