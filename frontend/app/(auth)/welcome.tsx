import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions, LayoutAnimation, Platform, UIManager, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function Welcome() {
  const router = useRouter();
  const images = [
    require('../../assets/images/welcome/welcome_1.jpg'),
    require('../../assets/images/welcome/welcome_2.jpg'),
    require('../../assets/images/welcome/welcome_3.jpg'),
  ];

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const pageWidth = SCREEN_WIDTH - 56; // account for container horizontal padding (28 * 2)
  // Autoplay configuration (ms)
  const AUTOPLAY_INTERVAL_MS = 3000;
  const ANIMATION_JUMP_DELAY_MS = 350; // time to wait for animated scroll to finish before jumping
  const PAUSE_AFTER_TAP_MS = 4000; // pause autoplay for this long after a dot tap

  // enable LayoutAnimation on Android (kept for other subtle layout changes)
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Animated value for pager dot scaling
  const animatedIndex = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // logical index 0..n-1
  const virtualIndexRef = useRef(1); // virtual index in cloned array (starts at 1)
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<number | null>(null);

  const setLogicalIndex = (i: number) => {
    // animate dot scale using Animated API (subtle)
    Animated.timing(animatedIndex, {
      toValue: i,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setCurrentIndex(i);
  };
  // Build virtual images array: [last, ...images, first] to allow seamless looping
  const virtImages = [images[images.length - 1], ...images, images[0]];

  // Initialize scroll position to the first real item (virtual index 1)
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
      // animate to next virtual page
      if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ x: nextVirtual * pageWidth, animated: true });
      }
      virtualIndexRef.current = nextVirtual;

      // If we've moved to the cloned first (virtual last index), schedule a jump to the real first
      if (nextVirtual === virtImages.length - 1) {
        // after animation completes, jump to virtual index 1 (real first)
        setTimeout(() => {
          if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
            scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
            virtualIndexRef.current = 1;
            setLogicalIndex(0);
          }
        }, ANIMATION_JUMP_DELAY_MS);
      } else {
        // normal case: update logical index
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

  const startBrowsing = () => {
    // route to the main tabs index (the swipe/index screen)
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ThemedText type="title" style={styles.title}>
        Bop & Browse
      </ThemedText>
      <ThemedText style={styles.byline}>Outfit Match App by shopbop</ThemedText>

      <View style={styles.carouselWrapper}>
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
          onMomentumScrollEnd={(e: any) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const vi = Math.round(offsetX / pageWidth);
            // update virtual index
            virtualIndexRef.current = vi;
            // if at cloned last (virtual 0), jump to real last
            if (vi === 0) {
              setTimeout(() => {
                if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
                  const lastVirtual = virtImages.length - 2; // index of real last
                  scrollRef.current.scrollTo({ x: lastVirtual * pageWidth, animated: false });
                  virtualIndexRef.current = lastVirtual;
                  setLogicalIndex(images.length - 1);
                }
              }, 0);
            } else if (vi === virtImages.length - 1) {
              // at cloned first, jump to real first
              setTimeout(() => {
                if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
                  scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
                  virtualIndexRef.current = 1;
                  setLogicalIndex(0);
                }
              }, 0);
            } else {
              // normal case: logical index = vi - 1
              setLogicalIndex(vi - 1);
            }
          }}
        >
          {virtImages.map((src, i) => (
            <View key={i} style={{ width: pageWidth, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={src} style={styles.hero} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Pager dots */}
      <View style={styles.dotsContainer}>
        {images.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              const targetVirtual = i + 1; // map logical index to virtual index
              virtualIndexRef.current = targetVirtual;
              setLogicalIndex(i);
              // pause autoplay for a short time after a manual tap
              setIsPaused(true);
              if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
              }
              // resume after PAUSE_AFTER_TAP_MS
              // @ts-ignore setTimeout return type
              pauseTimeoutRef.current = setTimeout(() => {
                setIsPaused(false);
                pauseTimeoutRef.current = null;
              }, PAUSE_AFTER_TAP_MS);

              if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
                scrollRef.current.scrollTo({ x: targetVirtual * pageWidth, animated: true });
              }
            }}
            activeOpacity={0.8}
            accessibilityLabel={`Go to image ${i + 1}`}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      scale: animatedIndex.interpolate({
                        // use neighboring indices; allow negative/overflow but clamp the output
                        inputRange: [i - 1, i, i + 1],
                        outputRange: [1, 1.18, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
                i === currentIndex ? styles.dotActive : null,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <ThemedText style={styles.caption}>Swipe your way to perfect outfit.</ThemedText>

      <TouchableOpacity style={styles.startButton} onPress={startBrowsing} activeOpacity={0.85}>
        <ThemedText style={styles.startText}>Start Browsing</ThemedText>
      </TouchableOpacity>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    justifyContent: 'center',
    transform: [{ translateY: -20 }],
    backgroundColor: '#ffffff',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 4,
  },
  byline: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  hero: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 16,
    // subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  carouselWrapper: {
    width: '100%',
    height: 360,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d2d6db',
  },
  dotActive: {
    backgroundColor: '#d49595',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  caption: {
    fontSize: 15,
    color: '#333',
    marginBottom: 18,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#d49595',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
