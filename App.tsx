// ─── Core Defense — Root App ──────────────────────────────────────────────────
import React from 'react';
import { StatusBar } from 'react-native';
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

  if (isLoading) {
    return <Loading message="Loading Core Defense…" />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
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
