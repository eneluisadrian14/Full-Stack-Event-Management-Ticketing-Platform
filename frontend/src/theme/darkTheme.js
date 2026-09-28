import { createTheme, alpha } from '@mui/material/styles';
import { tokens } from './tokens';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.primary.main,
      dark: tokens.primary.dark,
      light: tokens.primary.light,
      contrastText: '#0b0f14',
    },
    secondary: {
      main: tokens.text.secondary,
    },
    background: {
      default: tokens.background.default,
      paper: tokens.background.paper,
    },
    text: {
      primary: tokens.text.primary,
      secondary: tokens.text.secondary,
    },
    divider: tokens.divider,
    success: { main: tokens.success },
    error: { main: tokens.error },
    warning: { main: tokens.warning },
  },
  typography: {
    fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.background.default,
          color: tokens.text.primary,
          minHeight: '100vh',
        },
        '::selection': {
          backgroundColor: alpha(tokens.primary.main, 0.35),
          color: tokens.text.primary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.background.paper,
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.background.paper,
          border: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(tokens.background.paper, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${tokens.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600 },
        containedPrimary: {
          boxShadow: `0 4px 20px ${alpha(tokens.primary.main, 0.35)}`,
          '&:hover': {
            boxShadow: `0 6px 28px ${alpha(tokens.primary.main, 0.45)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(tokens.background.elevated, 0.6),
            '& fieldset': { borderColor: tokens.border },
            '&:hover fieldset': { borderColor: alpha(tokens.primary.main, 0.4) },
            '&.Mui-focused fieldset': { borderColor: tokens.primary.main },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.divider },
        head: { fontWeight: 700, backgroundColor: alpha(tokens.background.elevated, 0.5) },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, minHeight: 52 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.background.paper,
          borderRight: `1px solid ${tokens.border}`,
        },
      },
    },
  },
});
