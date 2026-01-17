'use client';

import { ISetting, saveSettings } from "@/app/actions";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';

// Mask API key to show only first 4 and last 4 characters
function maskApiKey(key: string | null): string {
  if (!key || key.length < 8) return '********';
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

// Check if a setting key is an API key
function isApiKeySetting(key: string): boolean {
  return key.toLowerCase().includes('apikey') || key.toLowerCase().includes('api_key');
}

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

interface SettingFieldProps {
  setting: ISetting;
  isEditing: boolean;
  editValue: string;
  onEdit: () => void;
  onCancel: () => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
  testResult: TestResult;
  onTest: () => void;
}

const SettingField = ({
  setting,
  isEditing,
  editValue,
  onEdit,
  onCancel,
  onValueChange,
  onSave,
  testResult,
  onTest,
}: SettingFieldProps) => {
  const isApiKey = isApiKeySetting(setting.key);
  const displayValue = isEditing ? editValue : (isApiKey ? maskApiKey(setting.value) : setting.value || '');

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: 'block',
          mb: 0.5,
        }}
      >
        {setting.description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          variant="outlined"
          label={setting.field}
          name={setting.key}
          value={displayValue}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={!isEditing}
          type={isApiKey && !isEditing ? 'text' : 'text'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: isEditing ? 'white' : '#f5f5f5',
              '&:hover fieldset': {
                borderColor: isEditing ? '#9966FF' : 'rgba(0, 0, 0, 0.23)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9966FF',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#9966FF',
            },
          }}
          InputProps={{
            endAdornment: testResult.status !== 'idle' && (
              <InputAdornment position="end">
                {testResult.status === 'testing' && (
                  <CircularProgress size={20} sx={{ color: '#9966FF' }} />
                )}
                {testResult.status === 'success' && (
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                )}
                {testResult.status === 'error' && (
                  <ErrorIcon sx={{ color: 'error.main' }} />
                )}
              </InputAdornment>
            ),
          }}
        />

        {!isEditing ? (
          <Button
            variant="outlined"
            onClick={onEdit}
            startIcon={<EditIcon />}
            sx={{
              minWidth: 90,
              height: 56,
              borderColor: '#9966FF',
              color: '#9966FF',
              '&:hover': {
                borderColor: '#7A52CC',
                bgcolor: 'rgba(153, 102, 255, 0.04)',
              },
            }}
          >
            Edit
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isApiKey && (
              <Button
                variant="outlined"
                onClick={onTest}
                disabled={testResult.status === 'testing' || !editValue}
                startIcon={<PlayArrowIcon />}
                sx={{
                  minWidth: 80,
                  height: 56,
                  borderColor: '#9966FF',
                  color: '#9966FF',
                  '&:hover': {
                    borderColor: '#7A52CC',
                    bgcolor: 'rgba(153, 102, 255, 0.04)',
                  },
                }}
              >
                Test
              </Button>
            )}
            <Button
              variant="contained"
              onClick={onSave}
              disabled={testResult.status === 'testing'}
              startIcon={<SaveIcon />}
              sx={{
                minWidth: 80,
                height: 56,
                bgcolor: '#9966FF',
                '&:hover': { bgcolor: '#7A52CC' },
              }}
            >
              Save
            </Button>
            <IconButton
              onClick={onCancel}
              sx={{
                height: 56,
                width: 56,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {testResult.message && (
        <Alert
          severity={testResult.status === 'success' ? 'success' : 'error'}
          sx={{ mt: 1 }}
        >
          {testResult.message}
        </Alert>
      )}
    </Box>
  );
};

interface SettingsFormProps {
  settings: ISetting[];
  databaseUrl?: string;
}

export default function SettingsForm({ settings, databaseUrl }: SettingsFormProps) {
  const [form, setForm] = useState<ISetting[]>(settings);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [showDbUrl, setShowDbUrl] = useState(false);

  const handleEdit = (key: string) => {
    const setting = form.find(s => s.key === key);
    setEditingKey(key);
    setEditValues({ ...editValues, [key]: setting?.value || '' });
    setTestResults({ ...testResults, [key]: { status: 'idle' } });
  };

  const handleCancel = (key: string) => {
    setEditingKey(null);
    setEditValues({ ...editValues, [key]: '' });
    setTestResults({ ...testResults, [key]: { status: 'idle' } });
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues({ ...editValues, [key]: value });
    // Reset test result when value changes
    if (testResults[key]?.status !== 'idle') {
      setTestResults({ ...testResults, [key]: { status: 'idle' } });
    }
  };

  const handleTest = async (key: string) => {
    const value = editValues[key];
    if (!value) return;

    setTestResults({ ...testResults, [key]: { status: 'testing' } });

    try {
      const response = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: key, apiKey: value }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResults({
          ...testResults,
          [key]: { status: 'success', message: data.message || 'Connection successful!' },
        });
      } else {
        setTestResults({
          ...testResults,
          [key]: { status: 'error', message: data.error || 'Connection failed' },
        });
      }
    } catch (e) {
      setTestResults({
        ...testResults,
        [key]: { status: 'error', message: 'Failed to test connection' },
      });
    }
  };

  const handleSave = async (key: string) => {
    const value = editValues[key];
    const updatedForm = form.map((setting) => {
      if (setting.key === key) {
        return { ...setting, value };
      }
      return setting;
    });

    await saveSettings(updatedForm);
    setForm(updatedForm);
    setEditingKey(null);
    setTestResults({ ...testResults, [key]: { status: 'idle' } });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 700 }}>
      {/* API Keys Section */}
      <Card
        sx={{
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              mb: 3,
            }}
          >
            API Configuration
          </Typography>

          {form.map((setting) => (
            <SettingField
              key={setting.key}
              setting={setting}
              isEditing={editingKey === setting.key}
              editValue={editValues[setting.key] || ''}
              onEdit={() => handleEdit(setting.key)}
              onCancel={() => handleCancel(setting.key)}
              onValueChange={(value) => handleValueChange(setting.key, value)}
              onSave={() => handleSave(setting.key)}
              testResult={testResults[setting.key] || { status: 'idle' }}
              onTest={() => handleTest(setting.key)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Database Section */}
      <Card
        sx={{
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            Database Connection
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 2,
            }}
          >
            The database connection string. To change this, update the DATABASE_URL environment variable and manage migrations separately.
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            label="DATABASE_URL"
            value={showDbUrl ? (databaseUrl || 'Not configured') : '********'}
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f5f5f5',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowDbUrl(!showDbUrl)}
                    edge="end"
                  >
                    {showDbUrl ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            This field is read-only. To change the database, update the DATABASE_URL environment variable in your deployment configuration.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
