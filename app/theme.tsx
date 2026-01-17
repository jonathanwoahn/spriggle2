'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Spriggle Brand Colors
const spriggleColors = {
  primary: {
    main: '#9966FF',
    light: '#C2A3FF',
    dark: '#5C3D99',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF8866',
    light: '#FFC1A3',
    dark: '#99523D',
    contrastText: '#FFFFFF',
  },
  accent: {
    main: '#66FFE0',
    light: '#A3FFED',
    dark: '#3D9987',
  },
  tertiary: {
    main: '#FFEB66',
    light: '#FFF3A3',
    dark: '#998D3D',
  },
};

// Shared typography configuration
const typography = {
  fontFamily: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  h1: {
    fontWeight: 700,
    fontSize: '3.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none' as const,
  },
};

// Shared shape configuration
const shape = {
  borderRadius: 16,
};

// Light Theme (Default)
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: spriggleColors.primary,
    secondary: spriggleColors.secondary,
    background: {
      default: '#FFFDF5', // Warm cream
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2640',
      secondary: '#6B5E80',
    },
    divider: 'rgba(45, 38, 64, 0.12)',
  },
  typography,
  shape,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(153, 102, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(153, 102, 255, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(153, 102, 255, 0.04)',
          },
        },
        text: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'rgba(153, 102, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #9966FF 0%, #7A52CC 100%)',
          boxShadow: '0 4px 20px rgba(153, 102, 255, 0.3)',
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9966FF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9966FF',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: '#2D2640',
        },
      },
    },
  },
});

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: spriggleColors.primary,
    secondary: spriggleColors.secondary,
    background: {
      default: '#1A1625', // Deep purple night
      paper: '#252033',
    },
    text: {
      primary: '#F5F0FF',
      secondary: '#C2B3D9',
    },
    divider: 'rgba(245, 240, 255, 0.12)',
  },
  typography,
  shape,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(153, 102, 255, 0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(153, 102, 255, 0.45)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(153, 102, 255, 0.08)',
          },
        },
        text: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'rgba(153, 102, 255, 0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #5C3D99 0%, #3D2966 100%)',
          boxShadow: '0 4px 20px rgba(92, 61, 153, 0.5)',
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9966FF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9966FF',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: '#3D2966',
        },
      },
    },
  },
});

// Use light theme as default
const theme = responsiveFontSizes(lightTheme);

export default theme;
export { lightTheme, darkTheme, spriggleColors };
