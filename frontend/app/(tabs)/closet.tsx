import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function ClosetScreen() {
  const { username } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inner}>
        <ThemedText type="title">Closet</ThemedText>
        <ThemedText style={styles.subtitle}>
          {username ? `Hello, ${username}` : 'Not signed in'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },
  subtitle: { marginTop: 8, color: '#666' },
});
