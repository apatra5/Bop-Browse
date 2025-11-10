import React, { useMemo, useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 10;
const NUM_COLUMNS = 3;
const ITEM_SIZE = Math.floor((width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS);
// Maintain the requested image box aspect ratio: 1128 x 2000 (W x H)
const ITEM_ASPECT_H_OVER_W = 2000 / 1128; // ~1.773
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
  // Mock items (placeholder) used until server data loads.
  const mockItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: String(i),
      title: `Item ${i + 1}`,
      // assign categories cyclically (skip 'Outfit' for variety)
      category: categories[(i % (categories.length - 1)) + 1],
      imageUrl: undefined,
    }));
  }, [categories]);
  type ClosetItem = {
    id: string;
    title: string;
    category?: string;
    imageUrl?: string | undefined;
    productUrl?: string | undefined;
  };

  const [items, setItems] = useState<ClosetItem[]>(mockItems as ClosetItem[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';
  const PRODUCT_PREFIX = 'https://shopbop.com/'

  // Predefined category names we care about; we'll call /categories and extract their ids.
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

  useEffect(() => {
    // fetch likes depending on the selectedCategory
    const fetchLikes = async () => {
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
            // If we couldn't resolve the category id, fall back to all likes
            resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
          }
        }

        const data = Array.isArray(resp?.data) ? resp.data : [];
        const mapped: ClosetItem[] = data.map((it: any) => ({
          id: String(it.id),
          title: it.name,
          imageUrl: it.image_url_suffix ? IMAGE_PREFIX + it.image_url_suffix : undefined,
          productUrl: it.product_detail_url ?  PRODUCT_PREFIX + it.product_detail_url : undefined,
        }));
        setItems(mapped);
        console.log(mapped);
      } catch (err: any) {
        console.error('Failed to fetch likes', err);
        setError('Failed to load likes');
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [userId, selectedCategory, categoryIdMap]);

  // If a specific category is selected and we resolved its id, items are already
  // filtered by the server via /likes/by-category, so don't filter again locally.
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
          onPress={() => {
            router.back();
          }}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => item.productUrl && Linking.openURL(item.productUrl)}
          >
            <View style={styles.thumbWrapper}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="contain" />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
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

  grid: { paddingBottom: 24 },
  gridItem: {
    width: ITEM_SIZE,
    marginLeft: ITEM_MARGIN,
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
  itemTitle: { marginTop: 6, fontSize: 12 },
  itemCategory: { fontSize: 11, color: '#888' },
  emptyWrap: { padding: 20, alignItems: 'center' },
});
