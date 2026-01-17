'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface EnvConfig {
  databaseUrl: string;
  cloudflareAccountId: string;
  cloudflareR2AccessKeyId: string;
  cloudflareR2SecretAccessKey: string;
  cloudflareR2BucketName: string;
}

interface DatabaseUrlStepProps {
  onComplete: (options?: { requiresRestart?: boolean }) => void;
  needsRestart: boolean;
}

export default function DatabaseUrlStep({ onComplete, needsRestart }: DatabaseUrlStepProps) {
  const [config, setConfig] = useState<EnvConfig>({
    databaseUrl: '',
    cloudflareAccountId: '',
    cloudflareR2AccessKeyId: '',
    cloudflareR2SecretAccessKey: '',
    cloudflareR2BucketName: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProduction, setIsProduction] = useState(false);
  const [existingConfig, setExistingConfig] = useState<Partial<EnvConfig>>({});

  useEffect(() => {
    // Fetch existing config to show what's already set
    fetch('/api/setup/write-env')
      .then(res => res.json())
      .then(data => {
        if (data.existing) {
          setExistingConfig(data.existing);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof EnvConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch('/api/setup/write-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isProduction) {
          setIsProduction(true);
          setError(data.error);
        } else {
          throw new Error(data.error || 'Failed to save configuration');
        }
        return;
      }

      // Successfully saved - needs restart
      onComplete({ requiresRestart: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isValid = config.databaseUrl &&
    config.cloudflareAccountId &&
    config.cloudflareR2AccessKeyId &&
    config.cloudflareR2SecretAccessKey &&
    config.cloudflareR2BucketName;

  if (needsRestart) {
    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <RefreshIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Restart Required
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your configuration has been saved to <code>.env.local</code>
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Configuration saved successfully!
          </Typography>
          <Typography variant="body2">
            Please restart your development server for the changes to take effect:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 1,
              p: 1,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            pnpm dev
          </Box>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          After restarting, refresh this page to continue setup.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Environment Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your database and storage connections.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          {isProduction && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Set these environment variables in your Vercel project settings, then redeploy.
            </Typography>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Database Section */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Database (PostgreSQL)
        </Typography>

        <Accordion defaultExpanded={false} sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="primary">
              How to get a PostgreSQL database
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1. Go to{' '}
              <Link href="https://neon.tech" target="_blank" rel="noopener">
                Neon
              </Link>{' '}
              (recommended) or{' '}
              <Link href="https://supabase.com" target="_blank" rel="noopener">
                Supabase
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2. Create a free account and new project
            </Typography>
            <Typography variant="body2">
              3. Copy the connection string (starts with <code>postgresql://</code>)
            </Typography>
          </AccordionDetails>
        </Accordion>

        <TextField
          label="Database URL"
          type="text"
          fullWidth
          required
          value={config.databaseUrl}
          onChange={handleChange('databaseUrl')}
          placeholder="postgresql://user:password@host/database"
          helperText={existingConfig.databaseUrl ? '✓ Already configured' : 'Your PostgreSQL connection string'}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* Cloudflare R2 Section */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Storage (Cloudflare R2)
        </Typography>

        <Accordion defaultExpanded={false} sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="primary">
              How to set up Cloudflare R2
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1. Go to{' '}
              <Link href="https://dash.cloudflare.com" target="_blank" rel="noopener">
                Cloudflare Dashboard
              </Link>{' '}
              and sign in
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2. Navigate to <strong>R2 Object Storage</strong> in the sidebar
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3. Click <strong>Create bucket</strong> and name it (e.g., &quot;spriggle-audio&quot;)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              4. Your <strong>Account ID</strong> is shown in the R2 dashboard URL or Account Home
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              5. Go to <strong>R2 &gt; Manage R2 API Tokens</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              6. Click <strong>Create API Token</strong> with &quot;Object Read &amp; Write&quot; permission
            </Typography>
            <Typography variant="body2">
              7. Copy the <strong>Access Key ID</strong> and <strong>Secret Access Key</strong>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <TextField
          label="Cloudflare Account ID"
          type="text"
          fullWidth
          required
          value={config.cloudflareAccountId}
          onChange={handleChange('cloudflareAccountId')}
          placeholder="47c7fa903e563f7cf160004a5362ac0a"
          helperText={existingConfig.cloudflareAccountId ? '✓ Already configured' : 'Found in your Cloudflare dashboard'}
          sx={{ mb: 2 }}
        />

        <TextField
          label="R2 Access Key ID"
          type="text"
          fullWidth
          required
          value={config.cloudflareR2AccessKeyId}
          onChange={handleChange('cloudflareR2AccessKeyId')}
          placeholder="6b14b53cdf04a23c71fb7d5549aa18c6"
          helperText={existingConfig.cloudflareR2AccessKeyId ? '✓ Already configured' : 'From R2 API token creation'}
          sx={{ mb: 2 }}
        />

        <TextField
          label="R2 Secret Access Key"
          type="text"
          fullWidth
          required
          value={config.cloudflareR2SecretAccessKey}
          onChange={handleChange('cloudflareR2SecretAccessKey')}
          placeholder="26b2b8ff77e118e20c71e530cc250a6b..."
          helperText={existingConfig.cloudflareR2SecretAccessKey ? '✓ Already configured' : 'From R2 API token creation'}
          sx={{ mb: 2 }}
        />

        <TextField
          label="R2 Bucket Name"
          type="text"
          fullWidth
          required
          value={config.cloudflareR2BucketName}
          onChange={handleChange('cloudflareR2BucketName')}
          placeholder="spriggle-audio"
          helperText={existingConfig.cloudflareR2BucketName ? '✓ Already configured' : 'The name of your R2 bucket'}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={saving || !isValid}
          sx={{ py: 1.5 }}
        >
          {saving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Save & Continue'
          )}
        </Button>
      </form>
    </Box>
  );
}
