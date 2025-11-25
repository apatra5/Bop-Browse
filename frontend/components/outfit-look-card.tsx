import React from 'react';
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
  onShopClick?: (outfit: any) => void;
  onItemClick?: (item: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const OutfitLookCard: React.FC<OutfitLookCardProps> = ({
  outfitData,
  lookTitle = "Look 1",
  imageBaseUrl = "https://m.media-amazon.com/images/G/01/Shopbop/p",
  onShopClick,
  onItemClick
}) => {
  if (!outfitData) return null;

  const { primaryImage, styleColors } = outfitData;
  const validStyleColors = styleColors?.filter((item: any) => item?.image?.src) || [];
  const itemCount = validStyleColors.length;

  const getImageUrl = (src?: string): string | undefined => {
    if (!src) return undefined;
    return src.startsWith('http') ? src : `${imageBaseUrl}${src}`;
  };

  const primaryImageUrl = getImageUrl(primaryImage?.src);
  if (!primaryImageUrl && validStyleColors.length === 0) return null;

  // --- Layout Calculations (Restored to Original Ratios) ---
  
  // Card margins (16 horizontal) + Card internal padding (16)
  const cardHorizontalMargin = 16 * 2;
  const cardInternalPadding = 16 * 2;
  const availableWidth = screenWidth - cardHorizontalMargin - cardInternalPadding;

  const colGap = 12;
  const innerGap = 8;

  // Primary is roughly 62% of the card width
  const primaryWidth = Math.round(availableWidth * 0.62);
  // Original Ratio: Height = Width * (16/9)
  const primaryHeight = Math.round(primaryWidth * (16 / 9));

  // The right column takes whatever space is left
  const rightWidth = Math.max(0, availableWidth - primaryWidth - colGap);

  // Split height for two rows of products
  const productTileHeight = Math.round((primaryHeight - innerGap) / 2);
  // Original Ratio: Width = Height * (9/16)
  const productTileWidth = Math.round(productTileHeight * (9 / 16));

  return (
    <View style={styles.cardContainer}>
      
      {/* Header: Title + Item Count Badge */}
      <View style={styles.header}>
        <Text style={styles.title}>{lookTitle}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount} Items</Text>
        </View>
      </View>

      {/* Main Content Row */}
      <View style={[styles.rowWrapper, { height: primaryHeight }]}>
        
        {/* Primary Image (Left) */}
        {primaryImageUrl && (
          <TouchableOpacity 
            activeOpacity={0.9}
            style={[
              styles.primaryImageContainer,
              { width: primaryWidth, height: primaryHeight, marginRight: colGap },
            ]}
          >
            <Image
              source={{ uri: primaryImageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Product Grid (Right - Scrollable) */}
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
                  return (
                    <TouchableOpacity
                      key={`r1-${idx}`}
                      onPress={() => onItemClick?.(item)}
                      activeOpacity={0.8}
                      style={[
                        styles.productImageContainer,
                        {
                          width: productTileWidth,
                          height: productTileHeight,
                          marginRight: innerGap,
                        },
                      ]}
                    >
                      {uri && <Image source={{ uri }} style={styles.image} resizeMode="cover" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Row 2 */}
              <View style={[styles.scrollRow, { height: productTileHeight }]}>
                {validStyleColors.map((item: any, idx: number) => {
                  if (idx % 2 === 0) return null;
                  const uri = getImageUrl(item?.image?.src);
                  return (
                    <TouchableOpacity
                      key={`r2-${idx}`}
                      onPress={() => onItemClick?.(item)}
                      activeOpacity={0.8}
                      style={[
                        styles.productImageContainer,
                        {
                          width: productTileWidth,
                          height: productTileHeight,
                          marginRight: innerGap,
                        },
                      ]}
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

      {/* Footer Button */}
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => onShopClick?.(outfitData)}
        activeOpacity={0.85}
      >
        <Text style={styles.shopButtonText}>SHOP THE LOOK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    // Soft Modern Shadow
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
    paddingRight: 4, // mild padding for scroll end
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
  shopButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});