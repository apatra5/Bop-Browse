import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface PreferenceCardProps {
  imageUrl: string;
  selected: boolean;
  onToggle: () => void;
  width?: number;
  height?: number;
}

export function PreferenceCard({ 
  imageUrl, 
  selected, 
  onToggle,
  width,
  height 
}: PreferenceCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Run animation when 'selected' state changes
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const handlePress = () => {
    // 1. Trigger haptic visual feedback (Scale Down -> Up)
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    
    // 2. Toggle state
    onToggle();
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={[
        styles.cardContainer, 
        width ? { width } : undefined,
        height ? { height } : undefined,
      ]}
    >
      <Animated.View style={[styles.innerContainer, { transform: [{ scale: scaleAnim }] }]}>
        {/* Product Image */}
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />

        {/* Selected Overlay (Darkens image + Shows Check) */}
        <Animated.View style={[styles.selectedOverlay, { opacity: overlayOpacity }]}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={16} color="#000" />
          </View>
        </Animated.View>
        
        {/* Unselected Indicator (Empty Circle) - Optional, helps discoverability */}
        {!selected && (
          <View style={styles.unselectedCircle} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    // Default fallback if width/height not passed
    aspectRatio: 0.7, 
    borderRadius: 8,
    // No shadow on container, keeps grid clean
  },
  innerContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', // Placeholder gray
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Overlay that appears when selected
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // Subtle darkening
    justifyContent: 'center', // Center the checkmark? Or Corner?
    alignItems: 'center',
    // Alternatively, align to top-right for corner style:
    // justifyContent: 'flex-start',
    // alignItems: 'flex-end',
    // padding: 10
  },

  // The Checkmark Circle
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // The Empty Circle (Unselected)
  unselectedCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)', // Semi-transparent white ring
    backgroundColor: 'transparent',
  },
});