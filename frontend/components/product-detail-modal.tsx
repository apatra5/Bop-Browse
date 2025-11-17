import { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { IconSymbol } from "./ui/icon-symbol";
import { ThemedText } from "./themed-text";
import { OutfitLookCard } from "./outfit-look-card"; // Import the new component

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface ProductDetailModalProps {
  itemId: string;
  visible: boolean;
  onClose: () => void;
}

interface OutfitData {
  styleColorOutfits: any[];
}

export function ProductDetailModal({
  itemId,
  visible,
  onClose,
}: ProductDetailModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollViewRef = useRef<ScrollView>(null);

  const [outfitData, setOutfitData] = useState<OutfitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !outfitData) {
      fetchOutfitData();
    }
  }, [visible, itemId]);

  const fetchOutfitData = async () => {
    setLoading(true);
    setError(null);

    try {
  console.log(`Fetching outfit data for item: ${itemId}`);
      
      const response = await fetch(
  `https://api.shopbop.com/public/products/${itemId}/outfits?lang=en-US`,
        {
          headers: {
            'accept': 'application/json',
            'Client-Id': 'Shopbop-UW-Team1-2025',
            'Client-Version': '1.0.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Outfit data fetched successfully:', data);
      setOutfitData(data);
    } catch (err) {
      console.error('Error fetching outfit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [visible]);

  const close = () => {
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 300, easing: Easing.in(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
          runOnJS(resetData)();
        }
      }
    );
  };

  const resetData = () => {
    setOutfitData(null);
    setError(null);
    setLoading(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleShopLookClick = (outfit: any) => {
    console.log('Shop the look clicked for outfit:', outfit.id);
    // Add your navigation or action logic here
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={close}>
              <IconSymbol name="chevron.down" size={28} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {loading && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#d49595" />
                <ThemedText style={styles.statusText}>Loading details...</ThemedText>
              </View>
            )}

            {error && (
              <View style={styles.centerContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOutfitData}>
                  <ThemedText style={styles.retryText}>Retry</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {outfitData && outfitData.styleColorOutfits && (
              <View>
                {outfitData.styleColorOutfits.map((styleColorOutfit, index) => 
                  styleColorOutfit.outfits?.map((outfit: any, outfitIndex: number) => (
                    <OutfitLookCard
                      key={`${index}-${outfitIndex}`}
                      outfitData={outfit}
                      lookTitle={`Look ${outfitIndex + 1}`}
                      imageBaseUrl="https://m.media-amazon.com/images/G/01/Shopbop/p"
                      onShopClick={handleShopLookClick}
                    />
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    height: SCREEN_HEIGHT,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: (Platform.OS === "ios" ? 60 : 20) + 12 + 20,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: SCREEN_HEIGHT - 150,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#B00020",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#d49595",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});