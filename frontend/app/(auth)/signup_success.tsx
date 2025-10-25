import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Easing } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function SignupSuccess() {
  const router = useRouter();

  const go = () => router.replace('/(tabs)');

  // animation refs
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // scale the circle with a springy feel, then fade in the check
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <ThemedText type="title">Bop & Browse</ThemedText>
        <ThemedText style={styles.byline}>Outfit Match App by shopbop</ThemedText>
      </View>

      <View style={styles.checkWrap}>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }] }>
          <Animated.Text style={[styles.checkMark, { opacity } ]}>✓</Animated.Text>
        </Animated.View>
        <ThemedText style={styles.youre}>You're all set!</ThemedText>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={go} activeOpacity={0.8}>
        <ThemedText style={styles.startText}>Start Browse</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  checkWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkCircle: {
    width: 86,
    height: 86,
    borderRadius: 86 / 2,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkMark: {
    color: '#fff',
    fontSize: 38,
  },
  youre: {
    color: '#777',
    fontSize: 12,
  },
  startButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDEDED',
    borderWidth: 1,
    borderColor: '#BFBFBF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#333',
    fontSize: 16,
  },
});
