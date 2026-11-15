import React from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { AppLayout } from './components/layout/AppLayout';

export function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            <AppLayout />
          </MusicPlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;

