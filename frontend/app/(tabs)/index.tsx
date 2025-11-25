import { ItemCard } from "@/components/item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Item } from "@/data/mock-items";
import { useState, useEffect } from "react";
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { FilterDropdown } from "@/components/filter-dropdown";

export default function SwipeScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // --- Filter categories ---
  const categories = [
    "Dresses",
    "Tops",
    "Matching Sets",
    "Swimsuits & Cover-Ups",
    "Sweaters & Knits",
    "Jeans",
    "Pants",
    "Jackets & Coats",
    "Skirts",
    "Activewear",
    "Wide Leg & Flare",
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

  // ------------------------ FETCH ITEMS ------------------------
  const fetchItems = async () => {
    try {
      setLoading(true);

      const categoryIds = selectedCategories.flatMap(
        (cat) => CATEGORY_MAP[cat] || []
      );

      console.log("Fetching items for:", selectedCategories, categoryIds);

      const response = await api.post("/items/personalized-feed", {
        user_id: userId,
        category_ids: categoryIds,
      });

      const fetchedItems = response.data.map((item: any) => {
        const suffix = item.image_url_suffix;
        const fullImageUrl = suffix
          ? `https://m.media-amazon.com/images/G/01/Shopbop/p${suffix}`
          : "";

        return {
          id: String(item.id),
          name: item.name,
          image_url: fullImageUrl,
          image_url_suffix: suffix,
          product_detail_url: item.product_detail_url,
          designer_name: item.designer_name,
          brand_name: item.designer_name,
          price: item.price,
          color: item.color,
          stretch: item.stretch ?? null,
          product_images: Array.isArray(item.product_images)
            ? item.product_images
            : [],
          brand_code: "",
          categories: Array.isArray(item.categories) ? item.categories : [],
        };
      });

      setItems(fetchedItems);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // refetch when applied filters change
  useEffect(() => {
    fetchItems();
  }, [selectedCategories]);

  // ------------------------ MORE ITEMS ------------------------
  const fetchMoreItems = async () => {
    if (isFetchingMore) return;

    try {
      setIsFetchingMore(true);
      const response = await api.get("/items/feed");

      const newItems = response.data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        image_url_suffix: item.image_url_suffix,
        image_url: item.image_url_suffix
          ? `https://m.media-amazon.com/images/G/01/Shopbop/p${item.image_url_suffix}`
          : "",
        product_detail_url: item.product_detail_url,
        designer_name: item.designer_name,
        brand_name: item.designer_name,
        price: item.price,
        color: item.color,
        stretch: item.stretch ?? null,
        product_images: Array.isArray(item.product_images)
          ? item.product_images
          : [],
        brand_code: "",
        categories: Array.isArray(item.categories) ? item.categories : [],
      }));

      setItems((prev) => [...prev.slice(currentIndex), ...newItems]);
      setCurrentIndex(0);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const threshold = Math.floor(items.length * 0.75);
    if (
      items.length > 0 &&
      currentIndex >= threshold &&
      !loading &&
      !isFetchingMore
    ) {
      fetchMoreItems();
    }
  }, [currentIndex, items.length]);

  // ------------------------ SWIPE ------------------------
  const handleSwipeLeft = async () => {
    const current = items[currentIndex];
    try {
      if (current && userId) {
        await api.post("/dislikes/", {
          user_id: Number(userId),
          item_id: current.id,
        });
      }
    } finally {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSwipeRight = async () => {
    const liked = items[currentIndex];
    try {
      if (liked && userId) {
        await api.post("/likes/", {
          user_id: Number(userId),
          item_id: liked.id,
        });
      }
    } finally {
      setLikedItems((prev) => (liked ? [...prev, liked] : prev));
      setCurrentIndex((i) => i + 1);
    }
  };

  // ------------------------ UI ------------------------
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
          <ThemedText type="title" style={{ color: "#000" }}>
            No More Items!
          </ThemedText>
          <ThemedText style={styles.endSubtitle}>
            You've seen all available items
          </ThemedText>
          <TouchableOpacity style={styles.resetButton} onPress={fetchItems}>
            <ThemedText style={styles.resetButtonText}>Start Over</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const current = items[currentIndex];
  const next = currentIndex + 1 < items.length ? items[currentIndex + 1] : null;

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.replace("/(auth)/welcome")}
        >
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Discover
        </ThemedText>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            setPendingSelection(selectedCategories); // preload previous selection
            setIsDropdownOpen(true);
          }}
        >
          <IconSymbol
            name="line.3.horizontal.decrease"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {/* MULTI-SELECT FILTER DROPDOWN */}
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
      <View style={styles.cardContainer}>
        {next && (
          <ItemCard
            key={`next-${next.id}`}
            item={next}
            isTop={false}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
          />
        )}
        <ItemCard
          key={`current-${current.id}`}
          item={current}
          isTop={true}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>

      {/* FOOTER ACTIONS */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.smallButton]}>
          <IconSymbol name="arrow.counterclockwise" size={20} color="#bac0ca" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton, styles.dislikeButton]}
          onPress={handleSwipeLeft}
        >
          <IconSymbol name="xmark" size={32} color="#545f71" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton, styles.likeButton]}
          onPress={handleSwipeRight}
        >
          <IconSymbol name="heart.fill" size={32} color="#d49595" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.smallButton]}>
          <IconSymbol name="bag" size={20} color="#bac0ca" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// --- Styles unchanged ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", paddingTop: 60 },
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
  cardContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  smallButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#eef1f4",
  },
  mainButton: { width: 64, height: 64, borderRadius: 32 },
  dislikeButton: { borderWidth: 2, borderColor: "#545f71" },
  likeButton: { borderWidth: 2, borderColor: "#d49595" },
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  endSubtitle: { fontSize: 16, textAlign: "center", color: "#545f71" },
  resetButton: {
    backgroundColor: "#d49595",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 24,
  },
  resetButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
});
