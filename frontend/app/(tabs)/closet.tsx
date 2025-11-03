import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
  const { username } = useAuth();
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

  // Mock items (placeholder) with categories assigned so the UI can filter.
  const mockItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: String(i),
      title: `Item ${i + 1}`,
      // assign categories cyclically (skip 'Outfit' for variety)
      category: categories[(i % (categories.length - 1)) + 1],
    }));
  }, [categories]);

  const visibleItems = mockItems.filter(
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
          {username ? `Hello, ${username}` : 'Not signed in'}
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
            <View style={styles.thumbPlaceholder} />
            <ThemedText type="defaultSemiBold" style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
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
  itemTitle: { marginTop: 6, fontSize: 12 },
  itemCategory: { fontSize: 11, color: '#888' },
  emptyWrap: { padding: 20, alignItems: 'center' },
});
