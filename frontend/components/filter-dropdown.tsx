import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
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
      {/* backdrop */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setIsOpen(false)}
      />

      {/* dropdown */}
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdown}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => {
              const checked = selectedCategories.includes(item);

              return (
                <TouchableOpacity
                  style={styles.option}
                  activeOpacity={0.6}
                  onPress={() => toggleCategory(item)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                    ]}
                  >
                    {checked && (
                      <IconSymbol
                        name="checkmark"
                        size={14}
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

          {/* footer actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
            >
              <ThemedText style={styles.clearButtonText}>
                Clear All
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply();
                setIsOpen(false); // ensure closing
              }}
            >
              <ThemedText style={styles.applyButtonText}>
                Apply
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
  },

  dropdownContainer: {
    position: "absolute",
    top: 100,
    right: 20,
  },

  dropdown: {
    backgroundColor: "#fff",
    width: 260,
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#d49595",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    backgroundColor: "#d49595",
    borderColor: "#d49595",
  },

  optionText: {
    fontSize: 15,
    color: "#333",
  },

  optionTextSelected: {
    fontWeight: "600",
    color: "#d49595",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  clearButtonText: {
    color: "#888",
    fontSize: 14,
  },

  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#d49595",
    borderRadius: 8,
  },

  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
