import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { ProductDetailModal } from '@/components/product-detail-modal';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 10;
const NUM_COLUMNS = 3;
const SCREEN_PADDING = 14;
const CONTENT_WIDTH = width - SCREEN_PADDING * 2;
const ITEM_SIZE = Math.floor((CONTENT_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS);
const ITEM_ASPECT_H_OVER_W = 2000 / 1128;
const ITEM_HEIGHT = Math.floor(ITEM_SIZE * ITEM_ASPECT_H_OVER_W);

export default function ClosetScreen() {
  const { userId, username } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const categories = useMemo(
    () => [
      'Outfit',
      'All Items',
      'Tops',
      'Bottoms',
      'Dresses',
      'Skirts'
    ],
    []
  );

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  
  type ClosetItem = {
    id: string;
    title: string;
    category?: string;
    imageUrl?: string | undefined;
    productUrl?: string | undefined;
  };

  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);

  const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';
  const PRODUCT_PREFIX = 'https://shopbop.com/'

  const PREDEFINED_CATEGORY_NAMES = useMemo(
    () => ['Tops', 'Bottoms', 'Dresses', 'Skirts', 'Outerwear', 'Shoes'],
    []
  );

  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, string | null>>({});

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
        console.log('Resolved category ids:', map);
      } catch (err) {
        console.error('Failed to fetch categories for ids', err);
      }
    };
    fetchCategoryIds();
  }, [PREDEFINED_CATEGORY_NAMES]);

  const fetchLikes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const api = (await import('@/api/axios')).default;

      let resp: any;
      if (selectedCategory === 'All Items' || selectedCategory === 'Outfit') {
        resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
      } else {
        const lookupId = categoryIdMap[selectedCategory];
        if (lookupId) {
          resp = await api.get(`/likes/by-category/${encodeURIComponent(userId)}`, {
            params: { category_id: lookupId },
          });
        } else {
          resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
        }
      }

      const data = Array.isArray(resp?.data) ? resp.data : [];
      console.log(data);
      const mapped: ClosetItem[] = data.map((it: any) => ({
        id: String(it.id),
        title: it.name,
        imageUrl: it.image_url_suffix ? IMAGE_PREFIX + it.image_url_suffix : undefined,
        productUrl: it.product_detail_url ? PRODUCT_PREFIX + it.product_detail_url : undefined,
      }));
      setItems(mapped);
    } catch (err: any) {
      console.error('Failed to fetch likes', err);
      setError('Failed to load likes');
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

  const handleRemove = useCallback(async (itemId: string, e?: any) => {
    // Stop propagation to prevent opening modal
    if (e) {
      e.stopPropagation();
    }
    
    if (!userId) return;
    setRemoving((prev) => ({ ...prev, [itemId]: true }));
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
      setItems(prevItems);
    } finally {
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  }, [userId, items, setItems]);

  const handleItemPress = useCallback((item: ClosetItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    // Small delay before clearing to allow animation to complete
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  const isServerFiltered =
    selectedCategory !== 'All Items' &&
    selectedCategory !== 'Outfit' &&
    Boolean(categoryIdMap[selectedCategory]);

  const visibleItems = isServerFiltered
    ? items
    : items.filter((it) => selectedCategory === 'All Items' || it.category === selectedCategory);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <IconSymbol name="chevron.left" size={22} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>
          Closet
        </ThemedText>

        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.topMeta}>
        <ThemedText style={styles.subtitle}>
          {userId ? `Hello, ${username ?? userId}` : 'Not signed in'}
        </ThemedText>
      </View>

      <View style={styles.chipsWrap}>
        {categories.map((cat) => {
          const selected = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(i) => i.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: ITEM_MARGIN }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.thumbWrapper}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="contain" />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
              <TouchableOpacity
                style={[styles.removeButton, removing[item.id] && { opacity: 0.4 }]}
                onPress={(e) => handleRemove(item.id, e)}
                disabled={!!removing[item.id]}
                accessibilityLabel="Remove from closet"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <IconSymbol name="xmark" size={16} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.itemName} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <TouchableOpacity
                style={styles.cartInlineButton}
                onPress={(e) => {
                  e.stopPropagation();
                  if (item.productUrl) Linking.openURL(item.productUrl);
                }}
                accessibilityLabel="View product"
              >
                <IconSymbol name="cart" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <ThemedText>No items in this category</ThemedText>
          </View>
        )}
      />

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
  container: { flex: 1, paddingHorizontal: 14 },
  headerRow: {
    height: 56,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: { textAlign: 'center' },
  rightSpacer: { width: 40 },
  topMeta: { marginBottom: 8 },
  subtitle: { color: '#666' },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#f6dede',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#704848', fontWeight: '600' },

  grid: { paddingBottom: 24, paddingRight: ITEM_MARGIN },
  gridItem: {
    width: ITEM_SIZE,
    marginBottom: ITEM_MARGIN,
    position: 'relative',
  },
  thumbWrapper: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#efefef',
  },
  thumbPlaceholder: {
    width: '100%',
    height: ITEM_HEIGHT,
    backgroundColor: '#efefef',
    borderRadius: 8,
  },
  thumbImage: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#efefef',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 6,
  },
  cartInlineButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  itemName: {
    flex: 1,
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: { padding: 20, alignItems: 'center' },
});