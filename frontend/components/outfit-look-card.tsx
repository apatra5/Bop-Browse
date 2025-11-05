import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

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
  const productImages = validStyleColors.slice(0, 4);
  const itemCount = validStyleColors.length;

  // Ensure the function never returns null
  const getImageUrl = (src?: string): string | undefined => {
    if (!src) return undefined;
    return src.startsWith('http') ? src : `${imageBaseUrl}${src}`;
  };

  const primaryImageUrl = getImageUrl(primaryImage?.src);
  if (!primaryImageUrl && productImages.length === 0) return null;

  // Layout constants
  const horizontalMargin = 16 * 2;
  const containerPadding = 20 * 2;
  const outerGutters = horizontalMargin + containerPadding;
  const colGap = 12;
  const innerGap = 8;
  const rowGap = 8;

  // Available width for the grid row
  const containerWidth = Math.max(0, screenWidth - outerGutters);

  // Start with a primary width fraction
  let primaryWidth = Math.round(containerWidth * 0.62);

  // Compute proportional sizes
  let primaryHeight = Math.round(primaryWidth * (16 / 9));
  let smallImageHeight = Math.round((primaryHeight - rowGap) / 2);
  let smallImageWidth = Math.round(smallImageHeight * (9 / 16));
  const maxIterations = 30;
  let iterations = 0;

  // Ensure two tiles fit on the right side
  while (iterations < maxIterations) {
    const rightWidthAvailable = containerWidth - primaryWidth - colGap;
    const totalNeededForTwo = smallImageWidth * 2 + innerGap;
    if (totalNeededForTwo <= rightWidthAvailable || primaryWidth <= Math.round(containerWidth * 0.4)) {
      break;
    }
    primaryWidth = Math.round(primaryWidth * 0.98);
    primaryHeight = Math.round(primaryWidth * (16 / 9));
    smallImageHeight = Math.round((primaryHeight - rowGap) / 2);
    smallImageWidth = Math.round(smallImageHeight * (9 / 16));
    iterations += 1;
  }

  const rightWidth = Math.max(0, containerWidth - primaryWidth - colGap);
  const gridRowHeight = smallImageHeight;
  const productTileWidth = smallImageWidth;
  const productTileHeight = smallImageHeight;

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

        {/* Right 2x2 Grid */}
        <View style={[styles.rightColumn, { width: rightWidth }]}>
          {/* Row 1 */}
          <View style={[styles.gridRow, { height: gridRowHeight, marginBottom: rowGap }]}>
            {[0, 1].map((idx) => {
              const img = productImages[idx];
              const uri = getImageUrl(img?.image?.src);
              return (
                <View
                  key={`r1-${idx}`}
                  style={[
                    styles.productImageContainer,
                    {
                      width: productTileWidth,
                      height: productTileHeight,
                      marginRight: idx === 0 ? innerGap : 0,
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
          <View style={[styles.gridRow, { height: gridRowHeight }]}>
            {[2, 3].map((idx) => {
              const img = productImages[idx];
              const uri = getImageUrl(img?.image?.src);
              return (
                <View
                  key={`r2-${idx}`}
                  style={[
                    styles.productImageContainer,
                    {
                      width: productTileWidth,
                      height: productTileHeight,
                      marginRight: idx === 2 ? innerGap : 0,
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
    justifyContent: 'center',
  },
  gridRow: {
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
