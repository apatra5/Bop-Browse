import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function AuthLanding() {
  const router = useRouter();

  const goToSignup = () => {
    // Navigate to the sign up screen within the auth group
    router.push('./signup');
  };

  const goToApp = () => router.replace('/(tabs)');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <ThemedText type="title">Bop & Browse</ThemedText>
        <ThemedText style={styles.byline}>Outfit Match App by shopbop</ThemedText>
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={goToSignup} activeOpacity={0.8}>
        <ThemedText style={styles.signupText}>Sign Up</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.amazonButton} onPress={goToApp} activeOpacity={0.8}>
        <ThemedText style={styles.amazonIcon}>a</ThemedText>
        <ThemedText style={styles.amazonText}>Login With Amazon</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToApp} style={styles.signinRow}>
        <ThemedText style={styles.small}>Already Have an Account?</ThemedText>
        <ThemedText style={styles.signin}> Sign In.</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120, // nudge content slightly above center
    gap: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  byline: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  signupButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#EDEDED',
    borderWidth: 1,
    borderColor: '#BFBFBF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#333',
    fontSize: 16,
  },
  amazonButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  amazonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  amazonText: {
    fontSize: 16,
    color: '#111',
  },
  signinRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  small: {
    fontSize: 12,
    color: '#777',
  },
  signin: {
    fontSize: 12,
    color: '#111',
  },
});
