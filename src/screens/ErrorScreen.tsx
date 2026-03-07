import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onReset?: () => void;
  error?: Error | null;
}

/**
 * Fullscreen error UI shown by ErrorBoundary when an uncaught error occurs.
 */
export default function ErrorScreen({ onReset, error }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💥</Text>
      <Text style={styles.title}>Something went wrong</Text>
      {error && (
        <Text style={styles.message} numberOfLines={4}>
          {error.message}
        </Text>
      )}
      {onReset && (
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
