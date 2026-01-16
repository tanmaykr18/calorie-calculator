import { createTheme } from '@mui/material/styles';

// Create a theme that adapts to dark mode
export const getTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#10b981', // Green
    },
    error: {
      main: '#ef4444', // Red
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    background: {
      default: isDarkMode ? '#0f172a' : '#f8fafc',
      paper: isDarkMode ? '#1e293b' : '#ffffff',
    },
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
          height: 8,
          padding: '13px 0',
        },
        track: {
          height: 8,
          borderRadius: 4,
          background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)',
          border: 'none',
        },
        rail: {
          height: 8,
          borderRadius: 4,
          opacity: 0.3,
          backgroundColor: isDarkMode ? '#475569' : '#cbd5e1',
        },
        thumb: {
          height: 20,
          width: 20,
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          border: `3px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
          boxShadow: isDarkMode 
            ? '0 2px 6px rgba(96, 165, 250, 0.5)' 
            : '0 2px 6px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(96, 165, 250, 0.7)'
              : '0 4px 12px rgba(59, 130, 246, 0.6)',
          },
          '&:active': {
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(96, 165, 250, 0.8)'
              : '0 2px 8px rgba(59, 130, 246, 0.8)',
          },
        },
        valueLabel: {
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f1f5f9' : '#1e293b',
          border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
        },
      },
    },
  },
});
