import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

export default function UserScreen() {
  const { userId, username, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const api = (await import('@/api/axios')).default;
      // Just fetching likes for the profile stat
      const likesRes = await api.get(`/likes/${encodeURIComponent(userId)}`);
      const likesArr = Array.isArray(likesRes?.data) ? likesRes.data : [];
      setLikesCount(likesArr.length);
    } catch (e) {
      console.error('Failed to fetch user counts', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/signin');
  };

  // --- Render: Not Signed In ---
  if (!userId) {
    return (
      <ThemedView style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.emptyAvatar}>
          <IconSymbol name="person.fill" size={40} color="#ccc" />
        </View>
        <ThemedText type="title" style={styles.emptyTitle}>GUEST</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Sign in to save your wardrobe and personalize your feed.
        </ThemedText>
        
        <TouchableOpacity 
          style={styles.blackButton} 
          onPress={() => router.replace('/(auth)/signin')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.blackButtonText}>SIGN IN</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // --- Render: Signed In ---
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
             {/* Placeholder for real avatar image logic */}
            <IconSymbol name="person.fill" size={48} color="#fff" />
          </View>
          
          <ThemedText style={styles.username}>{username?.toUpperCase() ?? 'USER'}</ThemedText>
          <ThemedText style={styles.userId}>MEMBER ID: {userId}</ThemedText>

          {/* Stat Badge */}
          <View style={styles.statBadge}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
               <ThemedText style={styles.statText}>
                 <ThemedText style={{fontWeight: '700'}}>{likesCount ?? 0}</ThemedText> LIKED ITEMS
               </ThemedText>
            )}
          </View>
        </View>

        {/* 2. Menu List */}
        <View style={styles.menuSection}>
          
          <MenuOption 
            icon="hanger" 
            label="MY CLOSET" 
            onPress={() => router.push('/(tabs)/closet')} 
          />
          
          <MenuOption 
            icon="arrow.clockwise" 
            label="REFRESH STATS" 
            onPress={fetchCounts} 
            hideChevron
          />
          
          <MenuOption 
             // Using gear or sliders for preferences
            icon="slider.horizontal.3" 
            label="STYLE PREFERENCES" 
            onPress={() => router.push('/preferences')} 
          />
        
        </View>

        {/* 3. Footer / Logout */}
        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.signOutText}>SIGN OUT</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.versionText}>VERSION 1.0.0</ThemedText>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

// --- Helper Component for List Items ---
const MenuOption = ({ 
  icon, 
  label, 
  onPress, 
  hideChevron = false 
}: { 
  icon: string, 
  label: string, 
  onPress: () => void,
  hideChevron?: boolean
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuLeft}>
      <IconSymbol name={icon as any} size={20} color="#1a1a1a" />
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
    </View>
    {!hideChevron && <IconSymbol name="chevron.right" size={16} color="#ccc" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // --- Header Styles ---
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a', // Editorial Black
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#000',
    marginBottom: 4,
  },
  userId: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statText: {
    fontSize: 12,
    color: '#333',
    letterSpacing: 0.5,
  },

  // --- Menu Styles ---
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 1,
  },

  // --- Footer/Sign Out ---
  footerSection: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#ddd', // Gentle border
    borderRadius: 6,
    marginBottom: 20,
  },
  signOutText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  versionText: {
    color: '#ccc',
    fontSize: 10,
  },

  // --- Not Signed In States ---
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 30,
  },
  blackButton: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  blackButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});