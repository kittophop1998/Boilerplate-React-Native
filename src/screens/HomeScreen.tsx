import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import useHelloQuery from '../hooks/useHelloQuery';
import Loading from '../components/Loading';

export default function HomeScreen({ navigation }: any) {
  const { data, isLoading, isError, error, refetch } = useHelloQuery();

  if (isLoading) return <Loading message="Fetching greeting..." />;

  if (isError)
    return (
      <View style={styles.container}>
        <Text>Error: {(error as Error).message}</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data?.message ?? 'Welcome'}</Text>
      <Button title="Open Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 12 },
});
