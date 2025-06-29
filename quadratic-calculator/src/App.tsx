import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import IphoneCalculator from './components/IphoneCalculator';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IphoneCalculator />
    </ThemeProvider>
  );
}

export default App;
