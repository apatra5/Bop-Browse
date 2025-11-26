import { ItemCard } from "@/components/item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Item } from "@/data/mock-items";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from "react-native";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { FilterDropdown } from "@/components/filter-dropdown";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SwipeScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  
  // State
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // --- Filter Logic ---
  const categories = [
    "Dresses", "Tops", "Matching Sets", "Swimsuits & Cover-Ups",
    "Sweaters & Knits", "Jeans", "Pants", "Jackets & Coats",
    "Skirts", "Activewear", "Wide Leg & Flare",
  ];

  const CATEGORY_MAP: Record<string, string[]> = {
    Dresses: ["13351"],
    Tops: ["13332"],
    "Matching Sets": ["13346"],
    "Swimsuits & Cover-Ups": ["13311"],
    "Sweaters & Knits": ["13317"],
    Jeans: ["13377"],
    Pants: ["13281"],
    "Jackets & Coats": ["13414"],
    Skirts: ["13302"],
    Activewear: ["74367"],
    "Wide Leg & Flare": ["13283"],
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- Data Fetching ---
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const categoryIds = selectedCategories.flatMap((cat) => CATEGORY_MAP[cat] || []);

      const response = await api.post("/items/personalized-feed", {
        user_id: userId,
        category_ids: categoryIds,
      });

      const fetchedItems = mapResponseToItems(response.data);
      setItems(fetchedItems);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, userId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const fetchMoreItems = async () => {
    if (isFetchingMore) return;
    try {
      setIsFetchingMore(true);
      const response = await api.get("/items/feed");
      const newItems = mapResponseToItems(response.data);
      setItems((prev) => [...prev, ...newItems]);
    } catch(e) {
      console.error(e);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Helper to map API response
  const mapResponseToItems = (data: any[]): Item[] => {
    return data.map((item: any) => {
      const suffix = item.image_url_suffix;
      const fullImageUrl = suffix
          ? `https://m.media-amazon.com/images/G/01/Shopbop/p${suffix}`
          : item.image_url || "";

      return {
        id: String(item.id),
        name: item.name,
        image_url: fullImageUrl,
        image_url_suffix: suffix,
        product_detail_url: item.product_detail_url,
        designer_name: item.designer_name || item.brand_name,
        brand_name: item.designer_name || item.brand_name,
        price: item.price,
        color: item.color,
        stretch: item.stretch ?? null,
        product_images: Array.isArray(item.product_images) ? item.product_images : [],
        categories: Array.isArray(item.categories) ? item.categories : [],
        brand_code: "", 
      };
    });
  };

  useEffect(() => {
    const threshold = items.length - 4;
    if (items.length > 0 && currentIndex >= threshold && !loading && !isFetchingMore) {
      fetchMoreItems();
    }
  }, [currentIndex, items.length]);

  // --- Interaction Handlers ---
  const handleSwipeLeft = async () => {
    const current = items[currentIndex];
    if (current && userId) {
      api.post("/dislikes/", { user_id: Number(userId), item_id: current.id }).catch(console.error);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = async () => {
    const current = items[currentIndex];
    if (current && userId) {
      api.post("/likes/", { user_id: Number(userId), item_id: current.id }).catch(console.error);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  // --- NEW: Rewind Handler ---
  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Logic for the stack
  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  // --- Render States ---
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <ThemedText style={styles.loadingText}>Curating your style...</ThemedText>
      </ThemedView>
    );
  }

  if (!currentItem) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.emptyStateContent}>
          <IconSymbol name="checkmark.circle" size={60} color="#000" />
          <ThemedText type="title" style={styles.emptyTitle}>
            You're all caught up!
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Check back later for new styles or update your filters.
          </ThemedText>
          <TouchableOpacity style={styles.resetButton} onPress={fetchItems}>
            <ThemedText style={styles.resetButtonText}>REFRESH FEED</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.replace("/(auth)/welcome")}
        >
          <IconSymbol name="chevron.left" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Discover
        </ThemedText>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setPendingSelection(selectedCategories);
            setIsDropdownOpen(true);
          }}
        >
          <View>
            <IconSymbol name="line.3.horizontal.decrease" size={24} color="#1a1a1a" />
            {selectedCategories.length > 0 && <View style={styles.filterBadge} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* FILTER DROPDOWN */}
      <FilterDropdown
        categories={categories}
        selectedCategories={pendingSelection}
        setSelectedCategories={setPendingSelection}
        onApply={() => {
          setSelectedCategories(pendingSelection);
          setIsDropdownOpen(false);
        }}
        onClear={() => setPendingSelection([])}
        isOpen={isDropdownOpen}
        setIsOpen={setIsDropdownOpen}
      />

      {/* CARD STACK */}
      <View style={styles.cardStack}>
        {nextItem && (
          <ItemCard
            key={`next-${nextItem.id}`}
            item={nextItem}
            isTop={false}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
          />
        )}
        
        <ItemCard
          key={`current-${currentItem.id}`}
          item={currentItem}
          isTop={true}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          // --- PASSED REWIND PROPS ---
          onRewind={handleRewind}
          canRewind={currentIndex > 0}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    height: 50,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d49595',
  },
  cardStack: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 22,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  resetButton: {
    marginTop: 32,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});