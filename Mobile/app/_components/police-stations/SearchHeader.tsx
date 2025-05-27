import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type SearchHeaderProps = {
  theme: any;
  isSearchActive: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearchActive: (isActive: boolean) => void;
};

const SearchHeader = ({
  theme,
  isSearchActive,
  searchQuery,
  setSearchQuery,
  setIsSearchActive,
}: SearchHeaderProps) => {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {!isSearchActive ? (
        <>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Police Stations
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsSearchActive(true);
            }}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color={theme.text} />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.text, backgroundColor: theme.inputBackground },
            ]}
            placeholder="Search by name, address or barangay"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSearchQuery("");
              setIsSearchActive(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  searchButton: {
    padding: 6,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    marginHorizontal: 8,
    fontSize: 16,
    borderRadius: 8,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchHeader;
