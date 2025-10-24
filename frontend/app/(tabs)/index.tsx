import { ItemCard } from "@/components/item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Item } from "@/data/mock-items";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import api from "@/api/axios";

export default function SwipeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/items/feed");
      const fetchedItems = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand_code: "",
        brand_name: "",
        image_url: `https://m.media-amazon.com/images/G/01/Shopbop/p${item.image_url_suffix}`,
        categories: [],
      }));

      console.log("[fetchItems] fetchedItems length:", fetchedItems.length);

      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch more items and clean up old ones
  const fetchMoreItems = async () => {
    if (isFetchingMore) return;

    try {
      setIsFetchingMore(true);
      const response = await api.get("/items/feed");
      const fetchedItems = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand_code: "",
        brand_name: "",
        image_url: `https://m.media-amazon.com/images/G/01/Shopbop/p${item.image_url_suffix}`,
        categories: [],
      }));

      console.log("[fetchMoreItems] fetchedItems length:", fetchedItems.length);

      setItems((prevItems) => {
        const itemsToKeep = prevItems.slice(currentIndex);
        const newList = [...itemsToKeep, ...fetchedItems];
        console.log(
          "[fetchMoreItems] prevItems:",
          prevItems.length,
          "| kept:",
          itemsToKeep.length,
          "| new total:",
          newList.length
        );
        return newList;
      });

      // Reset currentIndex since we've removed old items
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching more items:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Log whenever items list changes
  useEffect(() => {
    console.log("[useEffect] items updated, new length:", items.length);
  }, [items]);

  // Check if we need to fetch more items when currentIndex changes
  useEffect(() => {
    const threshold = Math.floor(items.length * 0.75);
    if (
      items.length > 0 &&
      currentIndex >= threshold &&
      !loading &&
      !isFetchingMore
    ) {
      console.log(
        `[useEffect] currentIndex=${currentIndex}, threshold=${threshold}, fetching more items...`
      );
      fetchMoreItems();
    }
  }, [currentIndex, items.length]);

  const handleSwipeLeft = () => {
    console.log("Disliked:", items[currentIndex]?.name);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSwipeRight = () => {
    const likedItem = items[currentIndex];
    console.log("Liked:", likedItem?.name);
    setLikedItems((prev) => [...prev, likedItem]);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDislikePress = () => {
    handleSwipeLeft();
  };

  const handleLikePress = () => {
    handleSwipeRight();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.endContainer}>
          <ActivityIndicator size="large" color="#d49595" />
          <ThemedText style={{ marginTop: 16, color: "#545f71" }}>
            Loading items...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.endContainer}>
          <ThemedText type="title" style={{ color: "#000000" }}>
            No More Items!
          </ThemedText>
          <ThemedText style={styles.endSubtitle}>
            You've seen all available items
          </ThemedText>
          <ThemedText style={styles.endStats}>
            Liked: {likedItems.length} items
          </ThemedText>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setCurrentIndex(0);
              fetchItems();
            }}
          >
            <ThemedText style={styles.resetButtonText}>Start Over</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const currentItem = items[currentIndex];
  const nextItem =
    currentIndex + 1 < items.length ? items[currentIndex + 1] : null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Discover
        </ThemedText>
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol name="cart" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {nextItem && (
          <ItemCard
            key={`next-${nextItem.id}`}
            item={nextItem}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            isTop={false}
          />
        )}
        <ItemCard
          key={`current-${currentItem.id}`}
          item={currentItem}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isTop={true}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.counterclockwise" size={20} color="#bac0ca" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton, styles.dislikeButton]}
          onPress={handleDislikePress}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={32} color="#545f71" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton, styles.likeButton]}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <IconSymbol name="heart.fill" size={32} color="#d49595" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          activeOpacity={0.7}
        >
          <IconSymbol name="bag" size={20} color="#bac0ca" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: 0.5,
  },
  stats: {
    fontSize: 14,
    color: "#545f71",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  actionButton: {
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  endSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#545f71",
  },
  endStats: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    color: "#545f71",
  },
  resetButton: {
    backgroundColor: "#d49595",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 24,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  smallButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#eef1f4",
  },
  // Updated main button styling to match Figma design with larger size
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  dislikeButton: {
    borderWidth: 2,
    borderColor: "#545f71",
  },
  likeButton: {
    borderWidth: 2,
    borderColor: "#d49595",
  },
});
