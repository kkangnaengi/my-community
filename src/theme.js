import { createTheme } from '@mui/material/styles';

/** 천리안 90년대 스타일 레트로 테마 */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ffff', contrastText: '#000033' },
    secondary: { main: '#ffff55', contrastText: '#000033' },
    error: { main: '#ff6b6b' },
    background: { default: '#000070', paper: '#00003c' },
    text: { primary: '#e8ffff', secondary: '#9fdfff' },
    divider: '#3a7bd5',
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: '"Nanum Gothic Coding", "Malgun Gothic", monospace',
    h1: { fontSize: '2.125rem', fontWeight: 700 },
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, border: '2px outset #55ffff' },
        containedPrimary: { backgroundColor: '#00bbbb', color: '#000033' },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none', border: '2px solid #3a7bd5' } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTableCell: { styleOverrides: { root: { padding: '14px 16px' } } },
  },
});

export default theme;
