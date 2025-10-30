import { useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { IconSymbol } from "./ui/icon-symbol";
import { Item } from "@/data/mock-items";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAG_THRESHOLD = 100;

interface ProductDetailModalProps {
  item: Item;
  visible: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  item,
  visible,
  onClose,
}: ProductDetailModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animate open
  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [visible]);

  // Close animation
  const close = () => {
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 300, easing: Easing.in(Easing.ease) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      }
    );
  };

  // Drag down to close
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY > DRAG_THRESHOLD) {
        close();
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen" // ✅ prevents iOS from injecting page sheet style
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <TouchableOpacity style={styles.closeButton} onPress={close}>
                <IconSymbol name="chevron.down" size={28} color="#000000" />
              </TouchableOpacity>
            </View>
          </GestureDetector>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Leave content blank for now */}
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#d2d6db",
    borderRadius: 2,
    marginBottom: 8,
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
});
