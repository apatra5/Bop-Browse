import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { LinearGradient } from 'expo-linear-gradient';

// --- Dimensions & Constants ---
const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const NUM_COLUMNS = 2;
const GAP = 12;

// Calculate Item Size
const AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2) - GAP;
const ITEM_WIDTH = Math.floor(AVAILABLE_WIDTH / NUM_COLUMNS);
const ITEM_HEIGHT = Math.floor(ITEM_WIDTH * 1.5); 

export default function ClosetScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- State ---
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);

  // --- Category Logic ---
  const categories = useMemo(() => [
    'All Items', 'Outfit', 'Tops', 'Bottoms', 'Dresses', 'Skirts'
  ], []);

  const PREDEFINED_CATEGORY_NAMES = useMemo(() => [
    'Tops', 'Bottoms', 'Dresses', 'Skirts', 'Outerwear', 'Shoes'
  ], []);

  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, string | null>>({});

  type ClosetItem = {
    id: string;
    title: string;
    category?: string;
    imageUrl?: string | undefined;
    productUrl?: string | undefined;
    brand?: string;
  };

  const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';
  const PRODUCT_PREFIX = 'https://shopbop.com/';

  // Load category IDs
  useEffect(() => {
    const fetchCategoryIds = async () => {
      try {
        const api = (await import('@/api/axios')).default;
        const resp = await api.get('/categories');
        const data = Array.isArray(resp?.data) ? resp.data : [];
        const map: Record<string, string | null> = {};
        PREDEFINED_CATEGORY_NAMES.forEach((name) => {
          const found = data.find((c: any) => (c.name || '').toLowerCase() === name.toLowerCase());
          map[name] = found ? String(found.id) : null;
        });
        setCategoryIdMap(map);
      } catch (err) {
        console.error('Failed to fetch categories for ids', err);
      }
    };
    fetchCategoryIds();
  }, [PREDEFINED_CATEGORY_NAMES]);

  // Load Likes
  const fetchLikes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const api = (await import('@/api/axios')).default;
      let resp: any;

      if (selectedCategory === 'All Items' || selectedCategory === 'Outfit') {
        resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
      } else {
        const lookupId = categoryIdMap[selectedCategory];
        const params = lookupId ? { category_id: lookupId } : {};
        const url = lookupId 
          ? `/likes/by-category/${encodeURIComponent(userId)}`
          : `/likes/${encodeURIComponent(userId)}`;
          
        resp = await api.get(url, { params });
      }

      const data = Array.isArray(resp?.data) ? resp.data : [];
      
      const mapped: ClosetItem[] = data.map((it: any) => ({
        id: String(it.id),
        title: it.name,
        imageUrl: it.image_url_suffix ? IMAGE_PREFIX + it.image_url_suffix : undefined,
        productUrl: it.product_detail_url ? PRODUCT_PREFIX + it.product_detail_url : undefined,
        brand: it.brand_name || it.designer_name || 'Designer',
      }));
      setItems(mapped);
    } catch (err: any) {
      console.error('Failed to fetch likes', err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCategory, categoryIdMap]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  useFocusEffect(
    React.useCallback(() => {
      fetchLikes();
    }, [fetchLikes])
  );

  // Remove Logic
  const handleRemove = useCallback(async (itemId: string) => {
    if (!userId) return;
    setRemoving((prev) => ({ ...prev, [itemId]: true }));
    
    // Optimistic Update
    const prevItems = items;
    setItems((curr) => curr.filter((it) => it.id !== itemId));

    try {
      const api = (await import('@/api/axios')).default;
      await api.delete('/likes/', {
        data: {
          user_id: Number(userId),
          item_id: String(itemId),
        },
      });
    } catch (e) {
      console.error('Failed to unlike item', e);
      setItems(prevItems); // Revert
    } finally {
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  }, [userId, items]);

  const handleItemPress = useCallback((item: ClosetItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  // Filter Logic
  const isServerFiltered =
    selectedCategory !== 'All Items' &&
    selectedCategory !== 'Outfit' &&
    Boolean(categoryIdMap[selectedCategory]);

  const visibleItems = isServerFiltered
    ? items
    : items.filter((it) => selectedCategory === 'All Items' || it.category === selectedCategory);


  // --- Render Components ---
  const renderItem = ({ item }: { item: ClosetItem }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.placeholder}>
             <IconSymbol name="photo" size={24} color="#ccc" />
          </View>
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.03)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemove(item.id);
          }}
          disabled={!!removing[item.id]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.removeIconCircle}>
            {removing[item.id] ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconSymbol name="xmark" size={12} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.metaContainer}>
        {item.brand && (
           <ThemedText style={styles.brandText} numberOfLines={1}>
            {item.brand.toUpperCase()}
          </ThemedText>
        )}
        <ThemedText style={styles.titleText} numberOfLines={1}>
          {item.title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header (Centered, No Back Button) */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <ThemedText type="subtitle" style={styles.headerTitle}>YOUR CLOSET</ThemedText>
          <ThemedText style={styles.itemCount}>
            {loading ? 'Updating...' : `${visibleItems.length} ITEMS`}
          </ThemedText>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {cat}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <View style={styles.centerEmpty}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(i) => i.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
              <IconSymbol name="heart.slash" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>No items found in {selectedCategory}</ThemedText>
              <ThemedText style={styles.emptySubText}>Go swipe to add some style!</ThemedText>
            </View>
          }
        />
      )}

      {selectedItem && (
        <ProductDetailModal
          itemId={selectedItem.id}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  
  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center', // Centered alignment
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 50,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#000',
  },
  itemCount: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Categories
  categoryContainer: {
    height: 50,
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: SCREEN_PADDING,
    alignItems: 'center',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Grid
  gridContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 40,
    paddingTop: 10,
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: 24, 
  },
  
  // Product Tile
  imageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: '#f9f9f9',
    borderRadius: 8, 
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  
  // Remove Button
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  removeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Meta Info
  metaContainer: {
    paddingHorizontal: 4,
  },
  brandText: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  // Empty State
  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
});