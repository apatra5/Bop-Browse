// frontend/components/item-card.tsx
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
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ThemedText } from "./themed-text";
import { Item } from "@/data/mock-items";
import { IconSymbol } from "./ui/icon-symbol";
import { useState, useRef, useEffect } from "react";
import { ProductDetailModal } from "./product-detail-modal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface ItemCardProps {
  item: Item;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export function ItemCard({
  item,
  onSwipeLeft,
  onSwipeRight,
  isTop,
}: ItemCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const [showDetails, setShowDetails] = useState(false);

  const handleOpenDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / 20;
      opacity.value = 1 - Math.abs(event.translationX) / SCREEN_WIDTH;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * SCREEN_WIDTH * 1.5,
          { duration: 450 },
          (finished) => {
            if (finished) {
              runOnJS(event.translationX > 0 ? onSwipeRight : onSwipeLeft)();
            }
          }
        );
        opacity.value = withTiming(0, { duration: 450 });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
        opacity.value = withSpring(1);
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

  // Green overlay for LIKE
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.35],
      "clamp"
    );
    return { opacity: translateX.value > 0 ? opacity : 0 };
  });

  // Red overlay for DISLIKE
  const dislikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0.35, 0],
      "clamp"
    );
    return { opacity: translateX.value < 0 ? opacity : 0 };
  });

  if (!isTop) {
    return (
      <View style={[styles.card, styles.cardBelow]}>
        <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
      </View>
    );
  }

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {/* Image Carousel */}
          <CarouselImages item={item} />

          {/* Green overlay for LIKE */}
          <Animated.View
            style={[
              styles.colorOverlay,
              { backgroundColor: "#4CAF50" },
              likeOverlayStyle,
            ]}
          />

          {/* Red overlay for DISLIKE */}
          <Animated.View
            style={[
              styles.colorOverlay,
              { backgroundColor: "#F44336" },
              dislikeOverlayStyle,
            ]}
          />

          {/* Up Arrow Button - Bottom Right */}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleOpenDetails}
            activeOpacity={0.8}
          >
            <IconSymbol name="chevron.up" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Bottom info gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View style={styles.infoContainer}>
              <ThemedText
                type="title"
                style={styles.itemName}
                numberOfLines={2}
              >
                {item.name}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.brandName}>
                {item.brand_name}
              </ThemedText>
              {item.price && (
                <ThemedText style={styles.price}>
                  {item.price}
                </ThemedText>
              )}
              <View style={styles.categoriesContainer}>
                {item.categories.map((category) => (
                  <View key={category.id} style={styles.categoryTag}>
                    <ThemedText style={styles.categoryText}>
                      {category.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>

      {/* Product Detail Modal */}
      <ProductDetailModal
        itemId={item.id}
        visible={showDetails}
        onClose={handleCloseDetails}
      />
    </>
  );
}

// Lightweight carousel component (infinite loop style) using product_images suffixes
function CarouselImages({ item }: { item: Item }) {
  const PREFIX = "https://m.media-amazon.com/images/G/01/Shopbop/p";
  const scrollRef = useRef<ScrollView | null>(null);
  const [pageWidth, setPageWidth] = useState(CARD_WIDTH);
  const [logicalIndex, setLogicalIndex] = useState(0);
  const virtualIndexRef = useRef(1); // starts at first real image
  const images: string[] = (item.product_images && item.product_images.length
    ? item.product_images
    : item.image_url_suffix
      ? [item.image_url_suffix]
      : [""]
  ).map((s) => (s.startsWith("http") ? s : `${PREFIX}${s}`));

  // Build virtual array [last, ...images, first]
  const virtImages = [images[images.length - 1], ...images, images[0]];
  const AUTOPLAY_MS = 4000;
  const JUMP_DELAY_MS = 350;
  // Use number for React Native timers
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize position
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
      virtualIndexRef.current = 1;
      setLogicalIndex(0);
    }
  }, [pageWidth, images.length]);

  useEffect(() => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  intervalRef.current = setInterval(() => {
      // advance virtual index
      let nextVirtual = virtualIndexRef.current + 1;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: pageWidth * nextVirtual, animated: true });
      }
      virtualIndexRef.current = nextVirtual;
      if (nextVirtual === virtImages.length - 1) {
        // wrapped to cloned first; jump back
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ x: pageWidth * 1, animated: false });
            virtualIndexRef.current = 1;
            setLogicalIndex(0);
          }
        }, JUMP_DELAY_MS);
      } else {
        const logical = (nextVirtual - 1 + images.length) % images.length;
        setLogicalIndex(logical);
      }
    }, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [images.length, pageWidth, virtImages.length]);

  return (
    <View style={styles.carouselContainer} onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // autoplay only to avoid gesture conflict with swipe deck
        contentContainerStyle={{ alignItems: "center" }}
      >
        {virtImages.map((src, i) => (
          <View key={i} style={{ width: pageWidth, height: CARD_HEIGHT }}>
            <Image
              source={{ uri: src || item.image_url }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        ))}
      </ScrollView>
      {/* Simple dots */}
      <View style={styles.carouselDots}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.carouselDot, i === logicalIndex && styles.carouselDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "absolute",
    overflow: "hidden",
  },
  cardBelow: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
    zIndex: -1,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  detailsButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 30, // Make room for the details button
    zIndex: 3,
  },
  infoContainer: {
    gap: 8,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  brandName: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: "white",
    fontWeight: "500",
  },
  price: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "600",
  },
  carouselContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  carouselDots: {
    position: "absolute",
    bottom: 20, // lift slightly for better separation from gradient
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    zIndex: 6, // above gradient (zIndex 3) and overlays
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  carouselDotActive: {
    backgroundColor: "#d49595",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});