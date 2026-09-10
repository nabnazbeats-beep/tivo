import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { AgencyProvider } from './context/AgencyContext';
import { TransactionProvider } from './context/TransactionContext';
import { AuditProvider } from './context/AuditContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import './index.css';

// Enregistrement du Service Worker PWA (actif en dev et prod pour tests offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Tivo Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.error('Tivo Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AgencyProvider>
          <NetworkProvider>
            <TransactionProvider>
              <AuditProvider>
                <NotificationProvider>
                  <CurrencyProvider>
                    <App />
                  </CurrencyProvider>
                </NotificationProvider>
              </AuditProvider>
            </TransactionProvider>
          </NetworkProvider>
        </AgencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
