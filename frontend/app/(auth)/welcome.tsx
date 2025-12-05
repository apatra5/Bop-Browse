import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Platform, 
  UIManager, 
  Animated, 
  StatusBar,
  ActivityIndicator, // Added for loading state
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext'; // Import Auth Context

// Use your API Base URL
const API_BASE_URL = 'http://0.0.0.0:8000'; 

export default function Welcome() {
  const router = useRouter();
  const { username } = useAuth(); // Get current username
  
  // NOTE: Ensure these images exist in your assets folder
  const images = [
    require('../../assets/images/welcome/welcome_1.jpg'),
    require('../../assets/images/welcome/welcome_2.jpg'),
    require('../../assets/images/welcome/welcome_3.jpg'),
  ];

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const CONTAINER_PADDING = 20;
  const CAROUSEL_HEIGHT = SCREEN_HEIGHT * 0.62; 
  const pageWidth = SCREEN_WIDTH - (CONTAINER_PADDING * 2);

  const AUTOPLAY_INTERVAL_MS = 4000;
  const ANIMATION_JUMP_DELAY_MS = 350;
  const PAUSE_AFTER_TAP_MS = 4000;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const animatedIndex = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const virtualIndexRef = useRef(1); 
  const [isPaused, setIsPaused] = useState(false);
  
  // NEW: Loading state for the API call
  const [checkingUser, setCheckingUser] = useState(false);
  
  const pauseTimeoutRef = useRef<number | null>(null);

  const setLogicalIndex = (i: number) => {
    Animated.timing(animatedIndex, {
      toValue: i,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setCurrentIndex(i);
  };

  const virtImages = [images[images.length - 1], ...images, images[0]];

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
        virtualIndexRef.current = 1;
        setLogicalIndex(0);
      }
    }, 0);
  }, [pageWidth]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isPaused) return;
      let nextVirtual = virtualIndexRef.current + 1;
      
      if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ x: nextVirtual * pageWidth, animated: true });
      }
      virtualIndexRef.current = nextVirtual;

      if (nextVirtual === virtImages.length - 1) {
        setTimeout(() => {
          if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
            scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
            virtualIndexRef.current = 1;
            setLogicalIndex(0);
          }
        }, ANIMATION_JUMP_DELAY_MS);
      } else {
        const logical = (nextVirtual - 1 + images.length) % images.length;
        setLogicalIndex(logical);
      }
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      clearInterval(id);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [images.length, pageWidth, isPaused]);

  // --- NEW LOGIC: Check User Status ---
  const startBrowsing = async () => {
    if (!username) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    setCheckingUser(true); // Start loading spinner

    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();

      // Check the is_new_user flag
      if (data.is_new_user === true) {
        // Go to preferences (First time)
        router.push('./preferences');
      } else {
        // Go directly to swiping/home page (Returning user)
        // assuming /(tabs) is your main app layout
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error("Error checking status:", error);
      // Fallback: Default to preferences if API fails
      router.push('./preferences');
    } finally {
      setCheckingUser(false);
    }
  };

  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const vi = Math.round(offsetX / pageWidth);
    virtualIndexRef.current = vi;

    if (vi === 0) {
      setTimeout(() => {
        if (scrollRef.current) {
          const lastVirtual = virtImages.length - 2;
          scrollRef.current.scrollTo({ x: lastVirtual * pageWidth, animated: false });
          virtualIndexRef.current = lastVirtual;
          setLogicalIndex(images.length - 1);
        }
      }, 0);
    } else if (vi === virtImages.length - 1) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
          virtualIndexRef.current = 1;
          setLogicalIndex(0);
        }
      }, 0);
    } else {
      setLogicalIndex(vi - 1);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          BOP & BROWSE
        </ThemedText>
        <ThemedText style={styles.byline}>CURATED BY SHOPBOP</ThemedText>
      </View>

      <View style={[styles.carouselWrapper, { height: CAROUSEL_HEIGHT }]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onScrollBeginDrag={() => setIsPaused(true)}
          onScrollEndDrag={() => setIsPaused(false)}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        >
          {virtImages.map((src, i) => (
            <View 
              key={i} 
              style={{ width: pageWidth, height: CAROUSEL_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Image 
                source={src} 
                style={styles.hero} 
                resizeMode="cover" 
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                const targetVirtual = i + 1;
                virtualIndexRef.current = targetVirtual;
                setLogicalIndex(i);
                setIsPaused(true);
                if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
                // @ts-ignore
                pauseTimeoutRef.current = setTimeout(() => {
                  setIsPaused(false);
                  pauseTimeoutRef.current = null;
                }, PAUSE_AFTER_TAP_MS);

                if (scrollRef.current) {
                  scrollRef.current.scrollTo({ x: targetVirtual * pageWidth, animated: true });
                }
              }}
              activeOpacity={0.8}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    transform: [{
                      scale: animatedIndex.interpolate({
                        inputRange: [i - 1, i, i + 1],
                        outputRange: [1, 1.2, 1],
                        extrapolate: 'clamp',
                      }),
                    }],
                  },
                  i === currentIndex ? styles.dotActive : null,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText style={styles.caption}>SWIPE YOUR WAY TO THE PERFECT LOOK</ThemedText>

        <TouchableOpacity 
          style={styles.startButton} 
          onPress={startBrowsing} 
          activeOpacity={0.9}
          disabled={checkingUser} // Disable button while checking
        >
          {checkingUser ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.startText}>START BROWSING</ThemedText>
          )}
        </TouchableOpacity>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 70, 
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
    color: '#000',
  },
  byline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  carouselWrapper: {
    width: '100%',
    marginBottom: 20,
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  dotActive: {
    backgroundColor: '#000',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  caption: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  startButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});