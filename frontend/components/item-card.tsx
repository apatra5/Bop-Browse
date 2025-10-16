import { Image } from 'expo-image';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ThemedText } from './themed-text';
import { Item } from '@/data/mock-items';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface ItemCardProps {
  item: Item;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export function ItemCard({ item, onSwipeLeft, onSwipeRight, isTop }: ItemCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / 20;
      // Fade out as card moves
      opacity.value = 1 - Math.abs(event.translationX) / SCREEN_WIDTH;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe detected - animate off screen
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(
          direction * SCREEN_WIDTH * 1.5,
          { damping: 20 },
          (finished) => {
            if (finished) {
              // Call the callback on JS thread
              runOnJS(event.translationX > 0 ? onSwipeRight : onSwipeLeft)();
            }
          }
        );
        opacity.value = withSpring(0);
      } else {
        // Reset position
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

  if (!isTop) {
    return (
      <View style={[styles.card, styles.cardBelow]}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.infoContainer}>
          <ThemedText type="title" style={styles.itemName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.brandName}>
            {item.brand_name}
          </ThemedText>
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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    overflow: 'hidden',
  },
  cardBelow: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '70%',
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    padding: 20,
    gap: 8,
    height: '30%',
    justifyContent: 'flex-start',
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
});