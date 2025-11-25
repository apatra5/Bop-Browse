import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { PreferenceCard } from '@/components/preference-card';

const IMAGE_BASE_URL = 'https://m.media-amazon.com/images/G/01/Shopbop/p';

interface ProductItem {
  id: string;
  name: string;
  image_url_suffix: string;
  product_detail_url: string;
}

export default function PreferencesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://0.0.0.0:8000/items/feed?offset=0&limit=20');
      const data: ProductItem[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const renderItem = ({ item }: { item: ProductItem }) => {
    const imageUrl = `${IMAGE_BASE_URL}${item.image_url_suffix}`;
    const isSelected = selected.has(item.id);

    return (
      <View style={styles.cardWrapper}>
        <PreferenceCard
          imageUrl={imageUrl}
          selected={isSelected}
          onToggle={() => toggleSelect(item.id)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={20}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Preferences</ThemedText>
            <ThemedText style={styles.subtitle}>
              Select styles you love
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#d49595" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selected.size === 0 && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={selected.size === 0}
        >
          <ThemedText style={styles.continueText}>
            {selected.size > 0 ? `Continue (${selected.size})` : 'Select styles'}
          </ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  safeAreaTop: {
    backgroundColor: '#fff',
    paddingTop: 6,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 12,
    paddingTop: 8,
  },

  backButton: {
    marginRight: 18,
    padding: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },

  subtitle: {
    fontSize: 15,
    color: '#777',
    marginTop: 2,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
  },

  /* 🎯 FIXED PERFECT GRID SPACING */
  cardWrapper: {
    flex: 1,
    marginBottom: 20,
    marginHorizontal: 6,
  },

  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Footer */
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#ffffffee',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },

  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 20,
    backgroundColor: '#d58c8c',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#d58c8c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  continueButtonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0,
  },

  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
