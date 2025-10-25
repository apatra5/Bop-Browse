import React, { useState, useMemo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import api from '../../api/axios';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Track which fields have been touched
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    username: false,
    password: false,
    confirm: false
  });

  const validation = useMemo(() => ({
    name: !name.trim() ? 'Name is required' : '',
    email: !email.trim() 
      ? 'Email is required' 
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Please enter a valid email address'
      : '',
    username: !username.trim()
      ? 'Username is required'
      : username.length < 3
      ? 'Username must be at least 3 characters'
      : '',
    password: !password
      ? 'Password is required'
      : password.length < 8
      ? 'Password must be at least 8 characters'
      : '',
    confirm: !confirm
      ? 'Please confirm your password'
      : password !== confirm
      ? 'Passwords do not match'
      : ''
  }), [name, email, username, password, confirm]);

  const canCreate = !Object.values(validation).some(error => error !== '');

  const onCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/users/', { username, password });
      if (resp.status === 201) {
        router.push('./signup_success');
      } else if (resp.status === 400) {
        setError(resp.data?.detail || 'Bad request');
      } else {
        setError('Server error');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        setError(err.response?.data?.detail || 'Username already registered');
      } else {
        setError('Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      <View style={styles.formWrap}>
            <ThemedText type="title" style={{ marginBottom: 32 }}>Create an Account</ThemedText>

        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Name" 
            style={[styles.input, touched.name && validation.name && styles.inputError]} 
            value={name} 
            onChangeText={setName}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
          />
          {touched.name && validation.name && <ThemedText style={styles.helperText}>{validation.name}</ThemedText>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Email" 
            style={[styles.input, touched.email && validation.email && styles.inputError]} 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoComplete="email" 
            autoCapitalize="none"
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          />
          {touched.email && validation.email && <ThemedText style={styles.helperText}>{validation.email}</ThemedText>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="User Name" 
            style={[styles.input, touched.username && validation.username && styles.inputError]} 
            value={username} 
            onChangeText={setUsername} 
            autoCapitalize="none"
            onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
          />
          {touched.username && validation.username && <ThemedText style={styles.helperText}>{validation.username}</ThemedText>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Password" 
            style={[styles.input, touched.password && validation.password && styles.inputError]} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            autoComplete="password"
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
          />
          {touched.password && validation.password && <ThemedText style={styles.helperText}>{validation.password}</ThemedText>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Confirm Password" 
            style={[styles.input, touched.confirm && validation.confirm && styles.inputError]} 
            value={confirm} 
            onChangeText={setConfirm} 
            secureTextEntry 
            autoComplete="password"
            onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
          />
          {touched.confirm && validation.confirm && <ThemedText style={styles.helperText}>{validation.confirm}</ThemedText>}
        </View>

        {error ? <ThemedText style={styles.helperText}>{error}</ThemedText> : null}

        <TouchableOpacity 
          style={[styles.createButton, (!canCreate || loading) && styles.createButtonDisabled]} 
          onPress={onCreate} 
          disabled={!canCreate || loading} 
          activeOpacity={0.8}
        >
          <ThemedText style={styles.createText}>{loading ? 'Creating…' : 'Create Account'}</ThemedText>
        </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('./signin')} style={styles.signinRow}>
              <ThemedText style={styles.small}>Already Have an Account?</ThemedText>
              <ThemedText style={styles.signin}> Sign In.</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardAvoid: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    minHeight: '100%',
  },
  formWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 8,
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
  createButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFBFBF',
    marginTop: 32,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createText: {
    color: '#333',
  },
  signinRow: {
    marginTop: 12,
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
  inputError: {
    borderColor: '#B00020',
  },
  helperText: {
    fontSize: 12,
    color: '#B00020',
    marginTop: 4,
    marginLeft: 4,
  },
});
