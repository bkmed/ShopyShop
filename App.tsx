import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { ModalProvider } from './src/context/ModalContext';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { WebThemeHandler } from './src/components/WebThemeHandler';
import './src/i18n'; // Initialize i18n

import { LoadingScreen } from './src/components/LoadingScreen';

const App = () => {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Initialize session management
    const initializeSession = async () => {
      try {
        const { authService } = await import('./src/services/authService');
        const { sessionService } = await import(
          './src/services/sessionService'
        );

        // Get current user from auth
        const currentUser = await authService.getCurrentUser();

        // Initialize session
        await sessionService.initSession(currentUser);

        // Listen for session expiry
        if (typeof window !== 'undefined') {
          const handleSessionExpiry = () => {
            console.log('Session expired - redirecting to login');
          };
          (window as any).addEventListener(
            'session_expired',
            handleSessionExpiry,
          );
        }

        console.log('Session service initialized');
      } catch (error) {
        console.error('Session initialization error:', error);
      }
    };

    const initialize = async () => {
      try {
        // Initialize session management
        await initializeSession();

        // Only initialize native modules on iOS/Android
        if (Platform.OS !== 'web') {
          await notificationService.initialize();
          console.log('App initialized successfully');
        } else {
          console.log('Running on web - Google Analytics auto-initialized');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ModalProvider>
                <SafeAreaProvider style={{ flex: 1 }}>
                  <WebThemeHandler />
                  <OfflineIndicator />
                  <AppNavigator />
                </SafeAreaProvider>
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
