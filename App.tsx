import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ImmersiveMode from 'react-native-immersive-mode';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@context/AuthContext';
import ErrorBoundary from '@components/ErrorBoundary';
import Loading from '@components/Loading';
import MainTabs from '@navigation/MainTabs';
import AuthNavigator from '@navigation/AuthNavigator';
import SplashScreen from '@screens/SplashScreen';

const queryClient = new QueryClient();

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

// ─── Inner navigator — consumes AuthContext ───────────────────────────────────
function RootNavigator() {
  const { token, isLoading, login, logout } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      ImmersiveMode.fullLayout(true);
      ImmersiveMode.setBarMode('Bottom');
    }

    return () => {
      if (Platform.OS === 'android') {
        ImmersiveMode.setBarMode('Normal');
        ImmersiveMode.fullLayout(false);
      }
    };
  }, []);

  if (isLoading) {
    return <Loading message="Loading Core Defense…" />;
  }

  if (!splashDone) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" hidden={true}/>
      <NavigationContainer theme={TransparentTheme}>
        {token ? (
          <MainTabs onLogout={logout} />
        ) : (
          <AuthNavigator onLogin={login} />
        )}
      </NavigationContainer>
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
