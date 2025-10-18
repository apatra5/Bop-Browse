import { ItemCard } from "@/components/item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Item, MOCK_ITEMS } from "@/data/mock-items";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function SwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const colorScheme = useColorScheme();

  const handleSwipeLeft = () => {
    console.log("Disliked:", MOCK_ITEMS[currentIndex].name);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSwipeRight = () => {
    const likedItem = MOCK_ITEMS[currentIndex];
    console.log("Liked:", likedItem.name);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDislikePress = () => {
    handleSwipeLeft();
  };

  const handleLikePress = () => {
    handleSwipeRight();
  };

  const currentItem = MOCK_ITEMS[currentIndex];
  const nextItem =
    currentIndex + 1 < MOCK_ITEMS.length ? MOCK_ITEMS[currentIndex + 1] : null;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.logo}>
          Bop-Browse
        </ThemedText>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Show next card behind */}
        {nextItem && (
          <ItemCard
            key={`next-${nextItem.id}`}
            item={nextItem}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            isTop={false}
          />
        )}
        {/* Show current card on top */}
        <ItemCard
          key={`current-${currentItem.id}`}
          item={currentItem}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isTop={true}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Undo Button - Left */}
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.counterclockwise" size={24} color="#d1d1d1" />
        </TouchableOpacity>

        {/* Dislike Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton]}
          onPress={handleDislikePress}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={36} color="#5a5a5a" />
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton]}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <IconSymbol name="heart.fill" size={36} color="#c97c7e" />
        </TouchableOpacity>

        {/* Lock/Save Button - Right */}
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          activeOpacity={0.7}
        >
          <IconSymbol name="lock.fill" size={24} color="#d1d1d1" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 28,
    marginBottom: 12,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoButton: {
    borderWidth: 2,
    borderColor: "#ddd",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  hintContainer: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: "white",
    fontSize: 14,
  },
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  endTitle: {
    fontSize: 36,
    textAlign: "center",
  },
  endSubtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
  endStats: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 24,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
  },
  viewLikesButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 8,
  },
  viewLikesButtonText: {
    color: "white",
    fontSize: 16,
  },

  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },

  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },

  dislikeButton: {
    borderColor: "#5a5a5a",
  },

  likeButton: {
    borderColor: "#5a5a5a",
  },
});
