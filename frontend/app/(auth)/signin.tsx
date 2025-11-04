import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

import api from '../../api/axios';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();

  const onSignIn = async () => {
    // Quick login: check user existence by username
    setError('');
    setLoading(true);
    try {
      // Using GET /users/{username} per API; successful 200 means user exists
        const res = await api.get(`/users/${encodeURIComponent(username)}`);
        // server returns user object with `id` field — store that id in auth
        const id = res?.data?.id;
        if (!id) throw new Error('Missing user id');
        auth.signIn(id);
      router.push('./welcome');
    } catch (err: any) {
      // Axios-style error handling
      const status = err?.response?.status;
      console.log(err);
      if (status === 404) {
        setError('Incorrect username');
      } else {
        setError('Server error');
      }
    } finally {
      setLoading(false);
    }
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

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

          <TouchableOpacity
            style={[
              styles.signinButton,
              (loading || !username || !password) && styles.signinButtonDisabled,
            ]}
            onPress={onSignIn}
            activeOpacity={0.8}
            disabled={loading || !username || !password}
          >
            <ThemedText style={styles.signinText}>{loading ? 'Signing in…' : 'SIGN IN'}</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.or}>Or</ThemedText>

          <TouchableOpacity style={styles.amazonButton} onPress={onSignIn} activeOpacity={0.8} disabled={loading}>
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
  errorText: {
    marginTop: 8,
    color: '#B00020',
    fontSize: 13,
  },
});
