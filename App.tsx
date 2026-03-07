/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@context/AuthContext';
import ErrorBoundary from '@components/ErrorBoundary';
import Loading from '@components/Loading';
import MainTabs from '@navigation/MainTabs';
import AuthNavigator from '@navigation/AuthNavigator';

const queryClient = new QueryClient();

// ─── Inner navigator — consumes AuthContext ───────────────────────────────────
function RootNavigator() {
  const { token, isLoading, login, logout } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  if (isLoading) {
    return <Loading message="Restoring session..." />;
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
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
