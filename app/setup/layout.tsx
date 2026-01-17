'use client';

import { Box, Container, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
  },
});

const STEPS = [
  { label: 'Database', key: 'database' },
  { label: 'Admin Account', key: 'admin' },
  { label: 'API Keys', key: 'api_keys' },
  { label: 'Complete', key: 'complete' },
];

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 3,
              p: 4,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Spriggle Setup
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 4 }}
            >
              Configure your audiobook platform
            </Typography>

            {children}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
