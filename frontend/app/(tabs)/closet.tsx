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
  ActivityIndicator,
  Alert
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { ClosetOutfitCard } from '@/components/closet-outfit-card'; 

// --- Dimensions & Constants ---
const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const NUM_COLUMNS = 2;
const GAP = 12;

const AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2) - GAP;
const ITEM_WIDTH = Math.floor(AVAILABLE_WIDTH / NUM_COLUMNS);
const ITEM_HEIGHT = Math.floor(ITEM_WIDTH * 1.5); 

// Base URLs
const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';
const PRODUCT_PREFIX = 'https://shopbop.com/';

// --- Types ---
type ProductItem = {
  id: string;
  title: string;
  brand: string;
  imageUrl?: string;
  productUrl?: string;
  category?: string;
};

export default function ClosetScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- State ---
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  
  // Data State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]); // Array of raw outfit objects
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, string | null>>({});

  // --- Categories ---
  const categories = useMemo(() => [
    'All Items', 'Outfit', 'Tops', 'Jeans', 'Pants', 'Jackets', 'Dresses', 'Skirts'
  ], []);

  useEffect(() => {
    setCategoryIdMap({
      Dresses: "13351",
      Tops: "13332",
      Jeans: "13377",
      Pants: "13281",
      Jackets: "13414",
      Skirts: "13302",
    });
  }, []);

  // --- Fetch Logic ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const api = (await import('@/api/axios')).default;

      // 1. Fetch Outfits
      if (selectedCategory === 'Outfit') {
        const resp = await api.get(`/likes/outfits/${encodeURIComponent(userId)}`);
        const rawList = resp?.data?.liked_outfits || []; 
        setOutfits(rawList);
      } 
      
      // 2. Fetch Products
      else {
        let resp: any;
        if (selectedCategory === 'All Items') {
          resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
        } else {
          const catId = categoryIdMap[selectedCategory];
          const url = catId 
            ? `/likes/by-category/${encodeURIComponent(userId)}`
            : `/likes/${encodeURIComponent(userId)}`;
          const params = catId ? { category_id: catId } : {};
          resp = await api.get(url, { params });
        }

        const rawList = Array.isArray(resp?.data) ? resp.data : [];
        const mapped: ProductItem[] = rawList.map((p: any) => ({
          id: String(p.id),
          title: p.name,
          brand: p.brand_name || p.designer_name || 'Designer',
          imageUrl: p.image_url_suffix ? `${IMAGE_PREFIX}${p.image_url_suffix}` : undefined,
          productUrl: p.product_detail_url ? `${PRODUCT_PREFIX}${p.product_detail_url}` : undefined,
          category: p.category
        }));
        
        setProducts(mapped);
      }

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCategory, categoryIdMap]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // --- Remove Logic (UPDATED) ---
  const handleRemove = async (id: string, isOutfit: boolean) => {
    if (!userId) return;
    setRemoving(prev => ({ ...prev, [id]: true }));

    // 1. Optimistic Update (Remove from UI immediately)
    if (isOutfit) {
      setOutfits(prev => prev.filter(o => String(o.id) !== id));
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }

    try {
      const api = (await import('@/api/axios')).default;
      
      if (isOutfit) {
        // --- NEW LOGIC FOR OUTFITS ---
        // DELETE /likes/outfits/
        // Payload: { user_id, item_id: <outfit_id> }
        await api.delete('/likes/outfits/', {
          data: { 
            user_id: Number(userId), 
            item_id: String(id) // Passing outfit ID to 'item_id' field as requested
          }
        });
      } else {
        // --- EXISTING LOGIC FOR PRODUCTS ---
        await api.delete('/likes/', {
          data: { 
            user_id: Number(userId), 
            item_id: String(id) 
          }
        });
      }

    } catch (e) {
      console.error('Delete failed', e);
      Alert.alert("Error", "Failed to delete item. It will reappear on refresh.");
      // Rollback on failure (simple re-fetch)
      fetchData(); 
    } finally {
      setRemoving(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleProductPress = (id: string) => {
    setSelectedProductId(id);
    setModalVisible(true);
  };

  // --- Render Individual Product (Grid Item) ---
  const renderProductItem = ({ item }: { item: ProductItem }) => {
    return (
      <TouchableOpacity 
        style={styles.gridItem}
        activeOpacity={0.9}
        onPress={() => handleProductPress(item.id)}
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

          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRemove(item.id, false);
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
          <ThemedText style={styles.brandText} numberOfLines={1}>
            {item.brand?.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.titleText} numberOfLines={1}>
            {item.title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  // --- Determine Mode ---
  const isOutfitMode = selectedCategory === 'Outfit';
  const currentData = isOutfitMode ? outfits : products;

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ThemedText type="title" style={styles.headerTitle}>
          Your Closet
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.subHeader}>
        <ThemedText style={styles.itemCount}>
          {loading ? 'Updating...' : `${currentData.length} SAVED`}
        </ThemedText>
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

      {/* DYNAMIC FLATLIST */}
      {loading && currentData.length === 0 ? (
        <View style={styles.centerEmpty}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          key={isOutfitMode ? 'outfits-stack' : 'products-grid'} 
          data={currentData}
          keyExtractor={(i) => String(i.id)}
          
          // Switch between Stack (1) and Grid (2)
          numColumns={isOutfitMode ? 1 : NUM_COLUMNS}
          
          contentContainerStyle={styles.gridContent}
          
          // Only use columnWrapper for grid mode
          columnWrapperStyle={!isOutfitMode ? { justifyContent: 'space-between' } : undefined}
          
          renderItem={({ item }) => {
            if (isOutfitMode) {
                return (
                    <ClosetOutfitCard 
                        outfit={item} 
                        onRemove={(id) => handleRemove(id, true)}
                        isRemoving={!!removing[item.id]}
                    />
                );
            }
            return renderProductItem({ item: item as ProductItem });
          }}
          
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
              <IconSymbol name="heart.slash" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>No items found</ThemedText>
              <ThemedText style={styles.emptySubText}>
                {isOutfitMode 
                  ? "Save complete looks to see them here" 
                  : "Go swipe to add items!"}
              </ThemedText>
            </View>
          }
        />
      )}

      {selectedProductId && (
        <ProductDetailModal
          itemId={selectedProductId}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setTimeout(() => setSelectedProductId(null), 300);
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
    height: 50, 
    zIndex: 10,
  },
  headerSpacer: { width: 40 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#000',
  },
  subHeader: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: -4, 
  },
  itemCount: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 1,
    fontWeight: '600',
  },
  categoryContainer: {
    height: 50,
    marginBottom: 6,
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
  gridContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 40,
    paddingTop: 10,
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: 24, 
  },
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
  metaContainer: {
    paddingHorizontal: 4,
  },
  brandText: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
    color: '#999',
    fontWeight: '700',
  },
  titleText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
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