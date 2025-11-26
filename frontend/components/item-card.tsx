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

  // --- CAROUSEL STATE ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get image count to prevent out-of-bounds
  const imagesCount = (item.product_images?.length || 0) > 0 
    ? item.product_images.length 
    : 1; // fallback if only main image exists

  // Detail Animation (Fade in Brand/Price on 2nd photo)
  const detailOpacity = useSharedValue(0);
  useEffect(() => {
    detailOpacity.value = withTiming(currentImageIndex > 0 ? 1 : 0, { duration: 300 });
  }, [currentImageIndex]);

  const detailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: detailOpacity.value,
    transform: [{ translateY: interpolate(detailOpacity.value, [0, 1], [10, 0]) }]
  }));

  const [showDetails, setShowDetails] = useState(false);

  // --- GESTURES ---

  // 1. Pan Gesture (Swipe Card)
  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    translateX.value = withTiming(targetX, { duration: 400 }, (finished) => {
      if (finished) runOnJS(direction === 'right' ? onSwipeRight : onSwipeLeft)();
    });
    opacity.value = withTiming(0, { duration: 300 });
    rotation.value = withTiming(direction === 'right' ? 10 : -10, { duration: 300 });
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-10, 10]) // Important: Allows taps to pass through!
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
          (finished) => { if (finished) runOnJS(event.translationX > 0 ? onSwipeRight : onSwipeLeft)(); }
        );
        opacity.value = withTiming(0, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        rotation.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  // 2. Tap Gesture (Manual Carousel Navigation)
  const tapGesture = Gesture.Tap()
    .enabled(isTop)
    .runOnJS(true)
    .maxDuration(250)
    .onEnd((e) => {
      const isLeftTap = e.x < CARD_WIDTH / 2;
      if (isLeftTap) {
        // Go Prev
        if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
      } else {
        // Go Next (Looping)
        setCurrentImageIndex(prev => (prev + 1) % imagesCount);
      }
    });

  // Combine gestures: Both can be active, but Pan waits for movement.
  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

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
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          
          {/* Controlled Carousel */}
          <CarouselImages 
            item={item} 
            activeIndex={currentImageIndex} 
          />

          {/* Stamps */}
          <View style={styles.stampsLayer} pointerEvents="none">
            <Animated.View style={[styles.stampContainer, styles.nopeStamp, nopeStampStyle]}>
              <ThemedText style={[styles.stampText, styles.nopeText]}>NOPE</ThemedText>
            </Animated.View>
            <Animated.View style={[styles.stampContainer, styles.likeStamp, likeStampStyle]}>
               <ThemedText style={[styles.stampText, styles.likeText]}>LIKE</ThemedText>
            </Animated.View>
          </View>

          {/* Info & Controls Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.9)"]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
            pointerEvents="box-none" // Allows taps to pass through empty areas to the TapGesture
          >
            <View style={styles.contentRow} pointerEvents="box-none">
              
              <View style={styles.textContainer} pointerEvents="none">
                <Animated.View style={detailAnimatedStyle}>
                   <ThemedText type="defaultSemiBold" style={styles.brandName}>
                    {item.brand_name.toUpperCase()}
                  </ThemedText>
                </Animated.View>

                <ThemedText type="title" style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                
                <Animated.View style={[styles.metaRow, detailAnimatedStyle]}>
                  {item.price && (
                    <ThemedText style={styles.price}>{item.price}</ThemedText>
                  )}
                </Animated.View>
              </View>

              {/* Action Buttons - Must explicitly handle touches */}
              <View style={styles.actionCluster} pointerEvents="auto">
                <TouchableOpacity 
                  style={[styles.actionBtn, !canRewind && styles.actionBtnDisabled]} 
                  onPress={onRewind}
                  disabled={!canRewind}
                  activeOpacity={0.7}
                >
                   <IconSymbol name="arrow.counterclockwise" size={20} color={canRewind ? "#fff" : "rgba(255,255,255,0.3)"} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNope]} onPress={() => triggerSwipe('left')}>
                   <IconSymbol name="xmark" size={22} color="#ff6b6b" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnLike]} onPress={() => triggerSwipe('right')}>
                   <IconSymbol name="heart.fill" size={22} color="#4cd964" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDetails(true)}>
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

// =======================================================
//            CONTROLLED CAROUSEL
// =======================================================
function CarouselImages({ 
  item, 
  activeIndex 
}: { 
  item: Item, 
  activeIndex: number 
}) {
  const PREFIX = "https://m.media-amazon.com/images/G/01/Shopbop/p";
  const scrollRef = useRef<ScrollView | null>(null);
  const [pageWidth, setPageWidth] = useState(CARD_WIDTH);

  const images: string[] = (item.product_images && item.product_images.length
    ? item.product_images
    : item.image_url_suffix
      ? [item.image_url_suffix]
      : [""]
  ).map((s) => (s.startsWith("http") ? s : `${PREFIX}${s}`));

  // React to parent index changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: pageWidth * activeIndex, animated: true });
    }
  }, [activeIndex, pageWidth]);

  return (
    <View
      style={styles.carouselContainer}
      onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // Disable manual scrolling, controlled by taps
        style={{ flex: 1 }}
      >
        {images.map((src, i) => (
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
                i === activeIndex && styles.carouselDotActive,
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
  
  // Stamps
  stampsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  stampContainer: {
    position: 'absolute',
    top: 45, 
    paddingHorizontal: 18, 
    paddingVertical: 8,
    borderWidth: 4, 
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)', 
  },
  stampText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 42,
  },
  nopeStamp: {
    left: 25, 
    borderColor: '#ff4b4b',
    transform: [{ rotate: '15deg' }],
  },
  nopeText: {
    color: '#ff4b4b',
  },
  likeStamp: {
    right: 25, 
    borderColor: '#4cd964',
    transform: [{ rotate: '-15deg' }],
  },
  likeText: {
    color: '#4cd964',
  },

  // Gradient
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