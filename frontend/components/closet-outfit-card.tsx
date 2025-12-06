import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_PREFIX = 'https://m.media-amazon.com/images/G/01/Shopbop/p';

interface ClosetOutfitCardProps {
  outfit: any;
  onRemove: (id: string) => void;
  isRemoving: boolean;
  onPress?: () => void; // Optional: To open details
}

export const ClosetOutfitCard = ({ outfit, onRemove, isRemoving, onPress }: ClosetOutfitCardProps) => {
  if (!outfit) return null;

  // --- 1. Data Preparation ---
  const mainImageSuffix = outfit.image_url_suffix;
  const items = outfit.items || [];
  
  const getUrl = (suffix: string) => {
    if (!suffix) return undefined;
    return suffix.startsWith('http') ? suffix : `${IMAGE_PREFIX}${suffix}`;
  };

  const mainImageUrl = getUrl(mainImageSuffix);

  // --- 2. Layout Constants ---
  const cardHorizontalMargin = 16;
  const cardInternalPadding = 16;
  const availableWidth = screenWidth - (cardHorizontalMargin * 2) - (cardInternalPadding * 2);
  
  const colGap = 12;
  const innerGap = 8;
  
  // Primary Image: ~62% width, 16:9 aspect ratio
  const primaryWidth = Math.round(availableWidth * 0.62);
  const primaryHeight = Math.round(primaryWidth * (16 / 9));
  
  // Right Column: Remaining width
  const rightWidth = Math.max(0, availableWidth - primaryWidth - colGap);
  
  // Product Tiles: Split height by 2 rows
  const productTileHeight = Math.round((primaryHeight - innerGap) / 2);
  const productTileWidth = Math.round(productTileHeight * (9 / 16));

  return (
    <View style={styles.cardContainer}>
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Saved Look</ThemedText>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{items.length} Items</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => onRemove(String(outfit.id))}
          disabled={isRemoving}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="#999" />
          ) : (
            <IconSymbol name="trash" size={20} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      {/* --- Body Content --- */}
      {/* Changed from TouchableOpacity to View to allow inner ScrollView to work */}
      <View style={[styles.rowWrapper, { height: primaryHeight }]}>
        
        {/* Left: Main Outfit Image (Clickable) */}
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.primaryImageContainer, { width: primaryWidth, height: primaryHeight, marginRight: colGap }]}
        >
            {mainImageUrl ? (
                <Image source={{ uri: mainImageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={styles.placeholder} />
            )}
        </TouchableOpacity>

        {/* Right: Scrollable Grid */}
        <View style={[styles.rightColumn, { width: rightWidth, height: primaryHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
          >
            <View>
              {/* Row 1: Even Indices */}
              <View style={[styles.scrollRow, { height: productTileHeight, marginBottom: innerGap }]}>
                {items.map((item: any, idx: number) => {
                  if (idx % 2 !== 0) return null;
                  const uri = getUrl(item.image_url_suffix);
                  return (
                    <TouchableOpacity 
                        key={`r1-${idx}`} 
                        activeOpacity={0.8}
                        onPress={onPress}
                        style={[styles.productImageContainer, { width: productTileWidth, height: productTileHeight, marginRight: innerGap }]}
                    >
                        {uri && <Image source={{ uri }} style={styles.image} resizeMode="cover" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Row 2: Odd Indices */}
              <View style={[styles.scrollRow, { height: productTileHeight }]}>
                {items.map((item: any, idx: number) => {
                  if (idx % 2 === 0) return null;
                  const uri = getUrl(item.image_url_suffix);
                  return (
                    <TouchableOpacity 
                        key={`r2-${idx}`} 
                        activeOpacity={0.8}
                        onPress={onPress}
                        style={[styles.productImageContainer, { width: productTileWidth, height: productTileHeight, marginRight: innerGap }]}
                    >
                        {uri && <Image source={{ uri }} style={styles.image} resizeMode="cover" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  primaryImageContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightColumn: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingRight: 4,
  },
  scrollRow: {
    flexDirection: 'row',
  },
  productImageContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  }
});