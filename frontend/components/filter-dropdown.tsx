import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

interface FilterDropdownProps {
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  onApply: () => void;
  onClear: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function FilterDropdown({
  categories,
  selectedCategories,
  setSelectedCategories,
  onApply,
  onClear,
  isOpen,
  setIsOpen,
}: FilterDropdownProps) {
  
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsOpen(false)}
    >
      {/* Invisible Backdrop to close modal */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setIsOpen(false)}
      />

      {/* Dropdown Content */}
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdown}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              const checked = selectedCategories.includes(item);

              return (
                <TouchableOpacity
                  style={styles.option}
                  activeOpacity={0.7}
                  onPress={() => toggleCategory(item)}
                >
                  {/* Custom Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                    ]}
                  >
                    {checked && (
                      <IconSymbol
                        name="checkmark"
                        size={12}
                        color="#fff"
                      />
                    )}
                  </View>

                  <ThemedText
                    style={[
                      styles.optionText,
                      checked && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
          />

          {/* Footer Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.clearButtonText}>
                Clear
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply();
                setIsOpen(false);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.applyButtonText}>
                APPLY
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Slight dimming of background
  },

  dropdownContainer: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 110 : 90, // Adjusted for typical header height
    right: 20,
    // Ensure it sits above everything else
    zIndex: 1000,
  },

  dropdown: {
    backgroundColor: "#fff",
    width: 280,
    borderRadius: 8, // Slightly sharper corners
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc", // Neutral grey border
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    backgroundColor: "#000", // Solid Black
    borderColor: "#000",
  },

  optionText: {
    fontSize: 14,
    color: "#444",
    letterSpacing: 0.2,
  },

  optionTextSelected: {
    fontWeight: "600",
    color: "#000",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    backgroundColor: '#fff',
  },

  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  clearButtonText: {
    color: "#888",
    fontSize: 13,
    fontWeight: '500',
  },

  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#000", // Black Button
    borderRadius: 6,
  },

  applyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1, // Uppercase spacing
  },
});