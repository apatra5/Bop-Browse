import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

interface OutfitLookCardProps {
  outfitData: any;
  lookTitle?: string;
  imageBaseUrl?: string;
  onShopClick?: (outfit: any) => void; // Triggers when clicking "Shop Look" (no selection)
  onItemClick?: (item: any) => void;   // Triggers when clicking an image
  onAddToCloset?: (items: any[]) => void; // Triggers for "Add Outfit" or "Add (X) Items"
}

const { width: screenWidth } = Dimensions.get('window');

export const OutfitLookCard: React.FC<OutfitLookCardProps> = ({
  outfitData,
  lookTitle = "Look 1",
  imageBaseUrl = "https://m.media-amazon.com/images/G/01/Shopbop/p",
  onShopClick,
  onItemClick,
  onAddToCloset
}) => {
  if (!outfitData) return null;

  const { primaryImage, styleColors } = outfitData;
  const validStyleColors = styleColors?.filter((item: any) => item?.image?.src) || [];
  const itemCount = validStyleColors.length;

  // --- Selection State ---
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  // --- Action Handlers ---
  
  // 1. Add Entire Outfit (Left Button)
  const handleAddAll = () => {
    onAddToCloset?.(validStyleColors);
  };

  // 2. Add Selected OR Shop Look (Right Button)
  const handleRightAction = () => {
    if (selectedIndices.size > 0) {
      // Add specific items
      const selectedItems = validStyleColors.filter((_: any, idx: number) => selectedIndices.has(idx));
      onAddToCloset?.(selectedItems);
    } else {
      // Fallback: Shop/View the whole look
      onShopClick?.(outfitData);
    }
  };

  const getImageUrl = (src?: string): string | undefined => {
    if (!src) return undefined;
    return src.startsWith('http') ? src : `${imageBaseUrl}${src}`;
  };

  const primaryImageUrl = getImageUrl(primaryImage?.src);
  if (!primaryImageUrl && validStyleColors.length === 0) return null;

  // --- Layout Constants ---
  const cardHorizontalMargin = 16 * 2;
  const cardInternalPadding = 16 * 2;
  const availableWidth = screenWidth - cardHorizontalMargin - cardInternalPadding;
  const colGap = 12;
  const innerGap = 8;
  const primaryWidth = Math.round(availableWidth * 0.62);
  const primaryHeight = Math.round(primaryWidth * (16 / 9));
  const rightWidth = Math.max(0, availableWidth - primaryWidth - colGap);
  const productTileHeight = Math.round((primaryHeight - innerGap) / 2);
  const productTileWidth = Math.round(productTileHeight * (9 / 16));

  // Helper for Selection Circle
  const SelectionToggle = ({ isSelected, onPress }: { isSelected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.selectionIcon, isSelected && styles.selectionIconActive]}>
        {isSelected ? "✓" : "+"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.cardContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{lookTitle}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount} Items</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.rowWrapper, { height: primaryHeight }]}>
        {primaryImageUrl && (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => onShopClick?.(outfitData)} 
            style={[
              styles.primaryImageContainer,
              { width: primaryWidth, height: primaryHeight, marginRight: colGap },
            ]}
          >
            <Image source={{ uri: primaryImageUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}

        <View style={[styles.rightColumn, { width: rightWidth, height: primaryHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View>
              {/* Row 1 */}
              <View style={[styles.scrollRow, { height: productTileHeight, marginBottom: innerGap }]}>
                {validStyleColors.map((item: any, idx: number) => {
                  if (idx % 2 !== 0) return null;
                  const uri = getImageUrl(item?.image?.src);
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <View key={`r1-${idx}`} style={[styles.productImageContainer, { width: productTileWidth, height: productTileHeight, marginRight: innerGap }]}>
                      <TouchableOpacity activeOpacity={0.8} onPress={() => onItemClick?.(item)} style={{ flex: 1 }}>
                        {uri && <Image source={{ uri }} style={[styles.image, isSelected && styles.imageSelected]} resizeMode="cover" />}
                      </TouchableOpacity>
                      <View style={styles.togglePosition}>
                        <SelectionToggle isSelected={isSelected} onPress={() => toggleSelection(idx)} />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Row 2 */}
              <View style={[styles.scrollRow, { height: productTileHeight }]}>
                {validStyleColors.map((item: any, idx: number) => {
                  if (idx % 2 === 0) return null;
                  const uri = getImageUrl(item?.image?.src);
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <View key={`r2-${idx}`} style={[styles.productImageContainer, { width: productTileWidth, height: productTileHeight, marginRight: innerGap }]}>
                      <TouchableOpacity activeOpacity={0.8} onPress={() => onItemClick?.(item)} style={{ flex: 1 }}>
                        {uri && <Image source={{ uri }} style={[styles.image, isSelected && styles.imageSelected]} resizeMode="cover" />}
                      </TouchableOpacity>
                      <View style={styles.togglePosition}>
                        <SelectionToggle isSelected={isSelected} onPress={() => toggleSelection(idx)} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* FOOTER: Two Button Layout */}
      <View style={styles.footerRow}>
        
        {/* Left: Add Entire Outfit (Secondary Style) */}
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonSecondary]}
          onPress={handleAddAll}
          activeOpacity={0.7}
        >
          <Text style={styles.textSecondary}>ADD OUTFIT</Text>
        </TouchableOpacity>

        {/* Right: Add Selected / Shop Look (Primary Style) */}
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonPrimary]}
          onPress={handleRightAction}
          activeOpacity={0.85}
        >
          <Text style={styles.textPrimary}>
            {selectedIndices.size > 0 
              ? `ADD (${selectedIndices.size}) ITEMS` 
              : "SHOP LOOK"
            }
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Previous layout styles preserved) ...
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageSelected: {
    opacity: 0.85,
  },
  togglePosition: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectionCircleActive: {
    backgroundColor: '#000',
  },
  selectionIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: -1,
  },
  selectionIconActive: {
    color: '#fff',
    fontSize: 12,
  },

  // --- NEW FOOTER STYLES ---
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Space between buttons
  },
  buttonBase: {
    flex: 1, // Equal width
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Primary (Black)
  buttonPrimary: {
    backgroundColor: '#000',
  },
  textPrimary: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Secondary (White with Border)
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  textSecondary: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});