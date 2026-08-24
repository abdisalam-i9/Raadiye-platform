import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CategoriesProvider } from './context/CategoriesContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <CategoriesProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </CategoriesProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
