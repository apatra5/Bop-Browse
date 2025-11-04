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
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 10;
const NUM_COLUMNS = 3;
const ITEM_SIZE = Math.floor((width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS);

export default function ClosetScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const categories = useMemo(
    () => [
      'Outfit',
      'All Items',
      'Top',
      'Bottom',
      'Dress',
      'Skirt',
      'Outerwear',
      'Shoes',
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
  };

  const [items, setItems] = useState<ClosetItem[]>(mockItems as ClosetItem[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';

  useEffect(() => {
    // fetch liked items for the signed-in user
    const fetchLikes = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        // use API helper (axios) to GET /likes/{userId}
        // import path uses alias; adjust if necessary
        const api = (await import('@/api/axios')).default;
        const resp = await api.get(`/likes/${encodeURIComponent(userId)}`);
        const data = Array.isArray(resp?.data) ? resp.data : [];
        const mapped = data.map((it: any) => ({
          id: String(it.id),
          title: it.name,
          imageUrl: it.image_url_suffix ? IMAGE_PREFIX + it.image_url_suffix : undefined,
          // no category provided by this endpoint; keep undefined so only 'All Items' shows them
        }));
        setItems(mapped);
      } catch (err: any) {
        console.error('Failed to fetch likes', err);
        setError('Failed to load likes');
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [userId]);

  const visibleItems = items.filter(
    (it) => selectedCategory === 'All Items' || it.category === selectedCategory
  );

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
          {userId ? `Hello, ${userId}` : 'Not signed in'}
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
          <View style={styles.gridItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} />
            ) : (
              <View style={styles.thumbPlaceholder} />
            )}
            <ThemedText type="defaultSemiBold" style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            {item.category ? <ThemedText style={styles.itemCategory}>{item.category}</ThemedText> : null}
          </View>
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
  },
  thumbPlaceholder: {
    width: '100%',
    height: ITEM_SIZE,
    backgroundColor: '#efefef',
    borderRadius: 8,
  },
  thumbImage: {
    width: '100%',
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: '#efefef',
  },
  itemTitle: { marginTop: 6, fontSize: 12 },
  itemCategory: { fontSize: 11, color: '#888' },
  emptyWrap: { padding: 20, alignItems: 'center' },
});
