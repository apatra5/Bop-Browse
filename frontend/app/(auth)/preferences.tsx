import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { PreferenceCard } from '@/components/preference-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

const IMAGE_BASE_URL = 'https://m.media-amazon.com/images/G/01/Shopbop/p';
const API_BASE_URL = 'http://0.0.0.0:8000'; 
const { width } = Dimensions.get('window');

// --- Layout Constants ---
const SCREEN_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 2;
const AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2) - GAP;
const ITEM_WIDTH = Math.floor(AVAILABLE_WIDTH / NUM_COLUMNS);

interface ProductItem {
  id: string;
  name: string;
  image_url_suffix: string;
  product_detail_url: string;
}

export default function PreferencesScreen() {
  // 1. Get username and setIsNewUser from context
  const { userId, username, setIsNewUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/items/feed?offset=0&limit=20`);
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

  const handleContinue = async () => {
    if (!userId || !username) {
      Alert.alert('Error', 'User information missing. Please log in again.');
      return;
    }

    setSubmitting(true);

    try {
      // --- STEP 1: Save Preferences (Parallel Requests) ---
      const selectedIds = Array.from(selected);
      
      const prefPromises = selectedIds.map((itemId) => {
        return fetch(`${API_BASE_URL}/preferences/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId, 
            item_id: itemId,
          }),
        });
      });

      const responses = await Promise.all(prefPromises);
      const allSuccessful = responses.every(res => res.ok);
      
      if (!allSuccessful) {
        console.warn('Some preferences failed to save');
      }

      // --- STEP 2: Update User "is_new_user" Flag to False ---
      const userUpdateResponse = await fetch(`${API_BASE_URL}/users/${username}/new-user-flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_new_user: false }),
      });

      if (!userUpdateResponse.ok) {
        console.error('Failed to update new user flag on backend');
      } else {
        // Update local app state so we don't need to refetch user data
        setIsNewUser(false);
      }

      // --- STEP 3: Navigate ---
      router.replace('/(tabs)');

    } catch (error) {
      console.error('Error in onboarding process:', error);
      Alert.alert('Error', 'There was a problem saving your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: ProductItem }) => {
    const imageUrl = `${IMAGE_BASE_URL}${item.image_url_suffix}`;
    const isSelected = selected.has(item.id);

    return (
      <View style={{ width: ITEM_WIDTH, marginBottom: 24 }}>
        <PreferenceCard
          imageUrl={imageUrl}
          selected={isSelected}
          onToggle={() => toggleSelect(item.id)}
          width={ITEM_WIDTH}
          height={Math.floor(ITEM_WIDTH * 1.5)}
        />
        <ThemedText 
          style={[styles.itemLabel, isSelected && styles.itemLabelSelected]} 
          numberOfLines={1}
        >
          {isSelected ? 'SELECTED' : item.name}
        </ThemedText>
      </View>
    );
  };

  const isContinueDisabled = selected.size < 3 || submitting;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.iconBtn} 
          hitSlop={20}
          disabled={submitting}
        >
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>STYLE QUIZ</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select at least 3 items
          </ThemedText>
        </View>

        <View style={styles.iconBtn} /> 
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}

      {/* Floating Footer */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isContinueDisabled && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.9}
          disabled={isContinueDisabled}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.continueText}>
              {selected.size > 0 ? `CONTINUE (${selected.size})` : 'SELECT ITEMS'}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 120, 
  },
  itemLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  itemLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#000', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});