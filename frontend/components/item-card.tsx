import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ThemedText } from "./themed-text";
import { Item } from "@/data/mock-items";
import { IconSymbol } from "./ui/icon-symbol";
import { useState, useRef, useEffect } from "react";
import { ProductDetailModal } from "./product-detail-modal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.92;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.72;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface ItemCardProps {
  item: Item;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  onRewind?: () => void;
  canRewind?: boolean;
}

export function ItemCard({
  item,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  onRewind,
  canRewind = false,
}: ItemCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const [showDetails, setShowDetails] = useState(false);

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    
    translateX.value = withTiming(targetX, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(direction === 'right' ? onSwipeRight : onSwipeLeft)();
      }
    });
    opacity.value = withTiming(0, { duration: 300 });
    rotation.value = withTiming(direction === 'right' ? 10 : -10, { duration: 300 });
  };

  const springConfig = {
    damping: 20,       
    stiffness: 150,    
    mass: 0.5,         
    overshootClamping: true, 
    restDisplacementThreshold: 0.1, 
    restSpeedThreshold: 0.1,
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-10, 10]) 
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / 25;
      opacity.value = 1 - Math.abs(event.translationX) / (SCREEN_WIDTH * 1.5);
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * SCREEN_WIDTH * 1.5,
          { duration: 400 },
          (finished) => {
            if (finished) {
              runOnJS(event.translationX > 0 ? onSwipeRight : onSwipeLeft)();
            }
          }
        );
        opacity.value = withTiming(0, { duration: 300 });
      } else {
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);
        rotation.value = withSpring(0, springConfig);
        opacity.value = withSpring(1, springConfig);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-20, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));


  if (!isTop) {
    return (
      <View style={[styles.card, styles.cardBelow]}>
        <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
        <View style={styles.backdropOverlay} />
      </View>
    );
  }

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          
          <CarouselImages item={item} />

          {/* --- STAMPS --- */}
          <View style={styles.stampsLayer} pointerEvents="none">
            <Animated.View style={[styles.stampContainer, styles.nopeStamp, nopeStampStyle]}>
              <ThemedText style={[styles.stampText, styles.nopeText]}>NOPE</ThemedText>
            </Animated.View>
            <Animated.View style={[styles.stampContainer, styles.likeStamp, likeStampStyle]}>
               <ThemedText style={[styles.stampText, styles.likeText]}>LIKE</ThemedText>
            </Animated.View>
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.9)"]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
            pointerEvents="box-none" 
          >
            <View style={styles.contentRow}>
              
              <View style={styles.textContainer}>
                 <ThemedText type="defaultSemiBold" style={styles.brandName}>
                  {item.brand_name.toUpperCase()}
                </ThemedText>
                <ThemedText type="title" style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                
                <View style={styles.metaRow}>
                  {item.price && (
                    <ThemedText style={styles.price}>{item.price}</ThemedText>
                  )}
                </View>
              </View>

              <View style={styles.actionCluster}>
                <TouchableOpacity 
                  style={[styles.actionBtn, !canRewind && styles.actionBtnDisabled]} 
                  onPress={onRewind}
                  disabled={!canRewind}
                  activeOpacity={0.7}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                   <IconSymbol 
                     name="arrow.counterclockwise" 
                     size={20} 
                     color={canRewind ? "#fff" : "rgba(255,255,255,0.3)"} 
                   />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnNope]} 
                  onPress={() => triggerSwipe('left')}
                  activeOpacity={0.7}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                   <IconSymbol name="xmark" size={22} color="#ff6b6b" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnLike]}
                  onPress={() => triggerSwipe('right')}
                  activeOpacity={0.7}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                   <IconSymbol name="heart.fill" size={22} color="#4cd964" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => setShowDetails(true)}
                  activeOpacity={0.7}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                   <IconSymbol name="ellipsis" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

            </View>
          </LinearGradient>

        </Animated.View>
      </GestureDetector>

      <ProductDetailModal itemId={item.id} visible={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

function CarouselImages({ item }: { item: Item }) {
  const PREFIX = "https://m.media-amazon.com/images/G/01/Shopbop/p";
  const scrollRef = useRef<ScrollView | null>(null);
  const [pageWidth, setPageWidth] = useState(CARD_WIDTH);
  const [logicalIndex, setLogicalIndex] = useState(0);
  const virtualIndexRef = useRef(1);

  const images: string[] = (item.product_images && item.product_images.length
    ? item.product_images
    : item.image_url_suffix
      ? [item.image_url_suffix]
      : [""]
  ).map((s) => (s.startsWith("http") ? s : `${PREFIX}${s}`));

  const virtImages = [images[images.length - 1], ...images, images[0]];
  const AUTOPLAY_MS = 5000; 
  const JUMP_DELAY_MS = 350;
  const intervalRef = useRef<number | null>(null);

  const goTo = (nextVirtual: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ x: pageWidth * nextVirtual, animated: true });
    virtualIndexRef.current = nextVirtual;

    if (nextVirtual === virtImages.length - 1) {
      setTimeout(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
        virtualIndexRef.current = 1;
        setLogicalIndex(0);
      }, JUMP_DELAY_MS);
    } else if (nextVirtual === 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: pageWidth * (virtImages.length - 2), animated: false });
        virtualIndexRef.current = virtImages.length - 2;
        setLogicalIndex(images.length - 1);
      }, JUMP_DELAY_MS);
    } else {
      setLogicalIndex((nextVirtual - 1 + images.length) % images.length);
    }
  };

  const goNext = () => goTo(virtualIndexRef.current + 1);
  const goPrev = () => goTo(virtualIndexRef.current - 1);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if(images.length > 1) {
      intervalRef.current = setInterval(goNext, AUTOPLAY_MS);
    }
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length, pageWidth, virtImages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: pageWidth * 1, animated: false });
    virtualIndexRef.current = 1;
    setLogicalIndex(0);
  }, [pageWidth, images.length]);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .onEnd((e) => {
      if (e.x < pageWidth * 0.35) goPrev();
      else goNext();
    });

  return (
    <View
      style={styles.carouselContainer}
      onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
    >
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} 
        style={{ flex: 1 }}
      >
        {virtImages.map((src, i) => (
          <View key={i} style={{ width: pageWidth, height: "100%" }}>
            <Image
              source={{ uri: src || item.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={200} 
            />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.carouselDots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.carouselDot,
                i === logicalIndex && styles.carouselDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    position: "absolute",
    overflow: "hidden",
  },
  cardBelow: {
    opacity: 1,
    transform: [{ scale: 0.96 }, { translateY: 15 }],
    zIndex: -1,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  
  // --- UPDATED STAMP STYLES TO PREVENT CROPPING ---
  stampsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  stampContainer: {
    position: 'absolute',
    top: 60, // Moved further down to clear corners
    paddingHorizontal: 18, // More horizontal padding
    paddingVertical: 8,
    borderWidth: 4, // Thicker border for clarity
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)', // Very subtle bg
  },
  stampText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 42, // Increased line height to prevent vertical clipping
  },
  nopeStamp: {
    left: 40, // Moved inward from edge
    borderColor: '#ff4b4b',
    transform: [{ rotate: '15deg' }],
  },
  nopeText: {
    color: '#ff4b4b',
  },
  likeStamp: {
    right: 40, // Moved inward from edge
    borderColor: '#4cd964',
    transform: [{ rotate: '-15deg' }],
  },
  likeText: {
    color: '#4cd964',
  },

  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 24,
    zIndex: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "600",
    color: "white",
    lineHeight: 26,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  actionCluster: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionBtnNope: {
    backgroundColor: 'rgba(255, 75, 75, 0.15)',
    borderColor: 'rgba(255, 75, 75, 0.3)',
  },
  actionBtnLike: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    borderColor: 'rgba(76, 217, 100, 0.3)',
  },
  carouselContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselDots: {
    position: "absolute",
    top: 20, 
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    zIndex: 15,
  },
  carouselDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  carouselDotActive: {
    backgroundColor: "#fff",
    transform: [{scale: 1.2}]
  },
});