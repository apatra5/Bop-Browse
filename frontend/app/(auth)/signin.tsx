import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function SignInScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSignIn = async () => {
    // Mock sign in delay
    await new Promise((r) => setTimeout(r, 600));
    // After sign in navigate into the app
    router.replace('/(tabs)');
  };

  const onSignup = () => router.push('./signup');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <ThemedText type="title">Bop & Browse</ThemedText>
            <ThemedText style={styles.byline}>Outfit Match App by shopbop</ThemedText>
          </View>

          <TextInput
            placeholder="User Name"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.signinButton, (!username || !password) && styles.signinButtonDisabled]}
            onPress={onSignIn}
            activeOpacity={0.8}
            disabled={!username || !password}
          >
            <ThemedText style={styles.signinText}>SIGN IN</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.or}>Or</ThemedText>

          <TouchableOpacity style={styles.amazonButton} onPress={onSignIn} activeOpacity={0.8}>
            <ThemedText style={styles.amazonIcon}>a</ThemedText>
            <ThemedText style={styles.amazonText}>Login With Amazon</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSignup} style={styles.signupRow}>
            <ThemedText style={styles.small}>Don't Have an Account?</ThemedText>
            <ThemedText style={styles.signup}> SIGN UP.</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120,
  },
  keyboardAvoid: {
    width: '100%',
  },
  inner: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  byline: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#BFBFBF',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  signinButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signinButtonDisabled: {
    opacity: 0.6,
  },
  signinText: {
    color: '#666',
    fontSize: 14,
  },
  or: {
    marginTop: 8,
    marginBottom: 4,
    color: '#777',
  },
  amazonButton: {
    width: '100%',
    paddingVertical: 12,
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
  },
  amazonText: {
    fontSize: 16,
    color: '#111',
  },
  signupRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  small: {
    fontSize: 12,
    color: '#777',
  },
  signup: {
    fontSize: 12,
    color: '#111',
  },
});
