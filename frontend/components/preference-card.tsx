import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface PreferenceCardProps {
  imageUrl: string;
  selected: boolean;
  onToggle: () => void;
}

export function PreferenceCard({ imageUrl, selected, onToggle }: PreferenceCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 90, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      <TouchableOpacity onPress={animatePress} style={styles.heartButton} activeOpacity={0.8}>
        <ThemedText
          style={[
            styles.heartIcon,
            { color: selected ? 'rgb(215,130,125)' : '#ffffffd9' },
          ]}
        >
          {selected ? '♥' : '♡'}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 0.68,
    backgroundColor: '#fdfdfd',
    borderRadius: 10,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  heartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,

    // ❤️ REMOVE DARK SHADOW
    backgroundColor: 'transparent',  
    padding: 0,
  },

  heartIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)', // clean white outline like Shopbop
  },
});
