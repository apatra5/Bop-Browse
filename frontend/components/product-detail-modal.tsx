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
import { Item } from "@/data/mock-items";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface ProductDetailModalProps {
  item: Item;
  visible: boolean;
  onClose: () => void;
}

interface OutfitData {
  styleColorOutfits: any[];
  // Add other fields as you discover them from the API response
}

export function ProductDetailModal({
  item,
  visible,
  onClose,
}: ProductDetailModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollViewRef = useRef<ScrollView>(null);

  // State for fetched data
  const [outfitData, setOutfitData] = useState<OutfitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch outfit data when modal opens
  useEffect(() => {
    if (visible && !outfitData) {
      fetchOutfitData();
    }
  }, [visible, item.id]);

  const fetchOutfitData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching outfit data for item: ${item.id}`);
      
      const response = await fetch(
        `https://api.shopbop.com/public/products/${item.id}/outfits?lang=en-US`,
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

  // Animate open
  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [visible]);

  // Close animation and reset data
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
            {/* Show loading state */}
            {loading && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#d49595" />
                <ThemedText style={styles.statusText}>Loading details...</ThemedText>
              </View>
            )}

            {/* Show error state with retry */}
            {error && (
              <View style={styles.centerContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOutfitData}>
                  <ThemedText style={styles.retryText}>Retry</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Show success message - will replace with actual content later */}
            {outfitData && (
              <View style={styles.centerContainer}>
                <ThemedText style={styles.successText}>
                  ✓ Data loaded successfully!
                </ThemedText>
                <ThemedText style={styles.debugText}>
                  {JSON.stringify(outfitData, null, 2).substring(0, 200)}...
                </ThemedText>
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
  successText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "left",
  },
});