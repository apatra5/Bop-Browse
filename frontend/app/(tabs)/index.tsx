import { ItemCard } from "@/components/item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Item } from "@/data/mock-items";
import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import api from "@/api/axios";

export default function SwipeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch items from backend
  // This should be ran whenever user has swiped 75% of the current items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items/feed');
      const fetchedItems = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand_code: '',
        brand_name: '',
        image_url: `https://m.media-amazon.com/images/G/01/Shopbop/p${item.image_url_suffix}`,
        categories: [],
      }));
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch more items and clean up old ones
  const fetchMoreItems = async () => {
    if (isFetchingMore) return;
    
    try {
      setIsFetchingMore(true);
      const response = await api.get('/items/feed');
      const fetchedItems = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand_code: '',
        brand_name: '',
        image_url: `https://m.media-amazon.com/images/G/01/Shopbop/p${item.image_url_suffix}`,
        categories: [],
      }));
      
      setItems(prevItems => {
        // Remove items before current index to prevent memory issues
        const itemsToKeep = prevItems.slice(currentIndex);
        return [...itemsToKeep, ...fetchedItems];
      });
      
      // Reset currentIndex since we've removed old items
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching more items:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Check if we need to fetch more items when currentIndex changes
  useEffect(() => {
    const threshold = Math.floor(items.length * 0.75);
    if (items.length > 0 && currentIndex >= threshold && !loading && !isFetchingMore) {
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
    setLikedItems(prev => [...prev, likedItem]);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDislikePress = () => {
    handleSwipeLeft();
  };

  const handleLikePress = () => {
    handleSwipeRight();
  };

  // Loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.endContainer}>
          <ActivityIndicator size="large" color="#c97c7e" />
          <ThemedText style={{ marginTop: 16 }}>Loading items...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // No items or end state
  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.endContainer}>
          <ThemedText type="title">No More Items!</ThemedText>
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
  const nextItem = currentIndex + 1 < items.length ? items[currentIndex + 1] : null;

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
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: "#666",
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
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
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
    backgroundColor: "#c97c7e",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 24,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
});