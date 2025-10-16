import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ItemCard } from '@/components/item-card';
import { MOCK_ITEMS, Item } from '@/data/mock-items';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const colorScheme = useColorScheme();

  const handleSwipeLeft = () => {
    console.log('Disliked:', MOCK_ITEMS[currentIndex].name);
    // Use setTimeout to ensure animation completes before state update
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 50);
  };

  const handleSwipeRight = () => {
    const likedItem = MOCK_ITEMS[currentIndex];
    console.log('Liked:', likedItem.name);
    setLikedItems((prev) => [...prev, likedItem]);
    // Use setTimeout to ensure animation completes before state update
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 50);
  };

  const handleDislikePress = () => {
    handleSwipeLeft();
  };

  const handleLikePress = () => {
    handleSwipeRight();
  };

  const handleViewLikes = () => {
    Alert.alert(
      'Liked Items',
      likedItems.length > 0
        ? likedItems.map((item) => item.name).join('\n')
        : 'No liked items yet!',
      [{ text: 'OK' }]
    );
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedItems([]);
  };

  // Check if we're at the end
  if (currentIndex >= MOCK_ITEMS.length) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.endContainer}>
          <ThemedText type="title" style={styles.endTitle}>
            🎉 All Done!
          </ThemedText>
          <ThemedText style={styles.endSubtitle}>
            You've seen all {MOCK_ITEMS.length} items
          </ThemedText>
          <ThemedText style={styles.endStats}>
            You liked {likedItems.length} items
          </ThemedText>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <ThemedText type="defaultSemiBold" style={styles.resetButtonText}>
              Start Over
            </ThemedText>
          </TouchableOpacity>
          {likedItems.length > 0 && (
            <TouchableOpacity style={styles.viewLikesButton} onPress={handleViewLikes}>
              <ThemedText type="defaultSemiBold" style={styles.viewLikesButtonText}>
                View Liked Items
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    );
  }

  const currentItem = MOCK_ITEMS[currentIndex];
  const nextItem = currentIndex + 1 < MOCK_ITEMS.length ? MOCK_ITEMS[currentIndex + 1] : null;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.logo}>
          Bop-Browse ✨
        </ThemedText>
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            {currentIndex + 1} / {MOCK_ITEMS.length}
          </ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / MOCK_ITEMS.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Show next card behind */}
        {nextItem && (
          <ItemCard
            key={`next-${nextItem.id}`}
            item={nextItem}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            isTop={false}
          />
        )}
        {/* Show current card on top */}
        <ItemCard
          key={`current-${currentItem.id}`}
          item={currentItem}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isTop={true}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={handleDislikePress}
          activeOpacity={0.7}>
          <IconSymbol name="xmark" size={32} color="#FF5252" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={handleViewLikes}
          activeOpacity={0.7}>
          <IconSymbol
            name="heart.fill"
            size={24}
            color={Colors[colorScheme ?? 'light'].tint}
          />
          {likedItems.length > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{likedItems.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleLikePress}
          activeOpacity={0.7}>
          <IconSymbol name="heart.fill" size={32} color="#00C853" />
        </TouchableOpacity>
      </View>

      {/* Swipe Hint */}
      {currentIndex === 0 && (
        <View style={styles.hintContainer}>
          <ThemedText style={styles.hintText}>
            👆 Swipe or use buttons below
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 28,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dislikeButton: {
    borderWidth: 3,
    borderColor: '#FF5252',
  },
  likeButton: {
    borderWidth: 3,
    borderColor: '#00C853',
  },
  infoButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  endTitle: {
    fontSize: 36,
    textAlign: 'center',
  },
  endSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  endStats: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 24,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
  },
  viewLikesButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 8,
  },
  viewLikesButtonText: {
    color: 'white',
    fontSize: 16,
  },
});