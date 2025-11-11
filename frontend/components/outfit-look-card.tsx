import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';

interface OutfitLookCardProps {
  outfitData: any;
  lookTitle?: string;
  imageBaseUrl?: string;
  onShopClick?: (outfit: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const OutfitLookCard: React.FC<OutfitLookCardProps> = ({
  outfitData,
  lookTitle = "Look 1",
  imageBaseUrl = "https://m.media-amazon.com/images/G/01/Shopbop/p",
  onShopClick,
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

  // Layout constants
  const horizontalMargin = 16 * 2;
  const containerPadding = 20 * 2;
  const outerGutters = horizontalMargin + containerPadding;
  const colGap = 12;
  const innerGap = 8;

  // Available width for the grid row
  const containerWidth = Math.max(0, screenWidth - outerGutters);

  // Primary image takes ~62% of width
  const primaryWidth = Math.round(containerWidth * 0.62);
  const primaryHeight = Math.round(primaryWidth * (16 / 9));

  // Right side width
  const rightWidth = Math.max(0, containerWidth - primaryWidth - colGap);

  // Product tile dimensions (2 rows high, portrait 9:16)
  const productTileHeight = Math.round((primaryHeight - innerGap) / 2);
  const productTileWidth = Math.round(productTileHeight * (9 / 16));

  const handleShopClick = () => onShopClick?.(outfitData);

  return (
    <View style={styles.container}>
      {/* Image Row */}
      <View style={[styles.rowWrapper, { height: primaryHeight }]}>
        {/* Primary Image */}
        {primaryImageUrl && (
          <View
            style={[
              styles.primaryImageContainer,
              { width: primaryWidth, height: primaryHeight, marginRight: colGap },
            ]}
          >
            <Image
              source={{ uri: primaryImageUrl }}
              style={styles.primaryImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Right Scrollable Column */}
        <View style={[styles.rightColumn, { width: rightWidth, height: primaryHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Row 1 */}
            <View style={[styles.scrollRow, { height: productTileHeight, marginBottom: innerGap }]}>
              {validStyleColors.map((item: any, idx: number) => {
                if (idx % 2 !== 0) return null; // Only odd indices for row 1
                const uri = getImageUrl(item?.image?.src);
                return (
                  <View
                    key={`r1-${idx}`}
                    style={[
                      styles.productImageContainer,
                      {
                        width: productTileWidth,
                        height: productTileHeight,
                        marginRight: innerGap,
                      },
                    ]}
                  >
                    {uri && (
                      <Image
                        source={{ uri }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Row 2 */}
            <View style={[styles.scrollRow, { height: productTileHeight }]}>
              {validStyleColors.map((item: any, idx: number) => {
                if (idx % 2 === 0) return null; // Only even indices for row 2
                const uri = getImageUrl(item?.image?.src);
                return (
                  <View
                    key={`r2-${idx}`}
                    style={[
                      styles.productImageContainer,
                      {
                        width: productTileWidth,
                        height: productTileHeight,
                        marginRight: innerGap,
                      },
                    ]}
                  >
                    {uri && (
                      <Image
                        source={{ uri }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.textSection}>
          <Text style={styles.title}>{lookTitle}</Text>
          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleShopClick} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Shop The Look</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  primaryImageContainer: {
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  primaryImage: {
    width: '100%',
    height: '100%',
  },
  rightColumn: {
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'column',
  },
  scrollRow: {
    flexDirection: 'row',
  },
  productImageContainer: {
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});