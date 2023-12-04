import React from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { store } from '@shared/store';
import App from './App';
import './index.css';

const queryClient = new QueryClient();
const THEME = createTheme({
  typography: {
    fontFamily: '@fonts/Montserrat-400.ttf',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    success: {
      main: 'rgba(58, 162, 43, 1)'
    }
  }
});
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={THEME}>
        <QueryClientProvider client={queryClient}>
          <AnimatePresence>
            <App />
          </AnimatePresence>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
