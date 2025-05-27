import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import * as Haptics from "expo-haptics";

type BarangayFiltersProps = {
  theme: any;
  barangays: string[];
  selectedBarangays: string[];
  toggleBarangayFilter: (barangay: string) => void;
};

const BarangayFilters = ({
  theme,
  barangays,
  selectedBarangays,
  toggleBarangayFilter,
}: BarangayFiltersProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContent}
      style={styles.filterContainer}
    >
      {barangays.map((barangay) => (
        <TouchableOpacity
          key={barangay}
          style={[
            styles.barangayFilter,
            selectedBarangays.includes(barangay) && [
              styles.activeBarangayFilter,
              { backgroundColor: theme.primary },
            ],
            { borderColor: theme.border },
          ]}
          onPress={() => toggleBarangayFilter(barangay)}
        >
          <Text
            style={[
              styles.barangayFilterText,
              {
                color: selectedBarangays.includes(barangay)
                  ? "#FFFFFF"
                  : theme.text,
              },
            ]}
          >
            {barangay}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  barangayFilter: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  activeBarangayFilter: {
    backgroundColor: "#0095F6",
    borderColor: "transparent",
  },
  barangayFilterText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default BarangayFilters;
