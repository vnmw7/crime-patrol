import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Linking,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// App components
import SearchHeader from "../_components/police-stations/SearchHeader";
import BarangayFilters from "../_components/police-stations/BarangayFilters";
import StationCard from "../_components/police-stations/StationCard";
import StationDetailsModal from "../_components/police-stations/StationDetailsModal";

// App theme colors
const themeColors = {
  light: {
    primary: "#0095F6", // Instagram blue as primary color
    secondary: "#FF3B30", // Red for danger/emergency
    tertiary: "#007AFF", // Blue for secondary actions
    background: "#FAFAFA", // Light background
    card: "#FFFFFF", // White card background
    text: "#262626", // Dark text
    textSecondary: "#8E8E8E", // Gray secondary text
    border: "#DBDBDB", // Light gray border
    inactiveTab: "#8E8E8E", // Inactive tab color
    inputBackground: "#F2F2F2",
    buttonBackground: "#F5F5F5",
    calloutBackground: "#FFFFFF",
    calloutBorder: "#E1E1E1",
    legendBackground: "#FFFFFF",
    overlay: "rgba(255, 255, 255, 0.7)",
    mapControlBackground: "#FFFFFF",
  },
  dark: {
    primary: "#0095F6", // Keep Instagram blue as primary
    secondary: "#FF453A", // Slightly adjusted red for dark mode
    tertiary: "#0A84FF", // Adjusted blue for dark mode
    background: "#121212", // Dark background
    card: "#1E1E1E", // Dark card background
    text: "#FFFFFF", // White text
    textSecondary: "#ABABAB", // Light gray secondary text
    border: "#2C2C2C", // Dark gray border
    inactiveTab: "#6E6E6E", // Inactive tab color for dark mode
    inputBackground: "#2C2C2C",
    buttonBackground: "#2C2C2C",
    calloutBackground: "#1E1E1E",
    calloutBorder: "#2C2C2C",
    legendBackground: "#1E1E1E",
    overlay: "rgba(0, 0, 0, 0.7)",
    mapControlBackground: "#1E1E1E",
  },
};

// Types for our data
type PoliceStationType = {
  id: string;
  name: string;
  address: string;
  contactNumbers: string[];
  location: {
    // Kept for data structure, not for map
    latitude: number;
    longitude: number;
  };
  barangay: string;
  type?: string; // Optional: to differentiate if needed
};

type EmergencyRespondentType = {
  id: string;
  name: string;
  address: string;
  contactNumbers: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  type: string;
};

// Police station data from Bacolod City
const policeStations: PoliceStationType[] = [
  {
    id: "1",
    name: "Police Station 1",
    address: "Bays Center, San Juan Street, Downtown Bacolod",
    contactNumbers: ["(034) 703-1673"],
    location: {
      latitude: 10.6749,
      longitude: 122.9529,
    },
    barangay: "Downtown",
  },
  {
    id: "2",
    name: "Police Station 2",
    address: "Barangay Handumanan, Bacolod City",
    contactNumbers: ["(034) 707-8301"],
    location: {
      latitude: 10.6633,
      longitude: 122.9452,
    },
    barangay: "Handumanan",
  },
  {
    id: "3",
    name: "Police Station 3",
    address: "13th Lacson Street, Barangay Mandalagan, Bacolod City",
    contactNumbers: ["(034) 434-8177"],
    location: {
      latitude: 10.6804,
      longitude: 122.9577,
    },
    barangay: "Mandalagan",
  },
  {
    id: "4",
    name: "Police Station 4",
    address: "Barangay Villamonte, Bacolod City",
    contactNumbers: ["(034) 433-5041", "(034) 708-3771", "(034) 708-1700"],
    location: {
      latitude: 10.668,
      longitude: 122.944,
    },
    barangay: "Villamonte",
  },
  {
    id: "5",
    name: "Police Station 5",
    address: "Barangay Granada, Bacolod City",
    contactNumbers: ["(034) 708-8291"],
    location: {
      latitude: 10.695,
      longitude: 122.965,
    },
    barangay: "Granada",
  },
  {
    id: "6",
    name: "Police Station 6",
    address: "Barangay Taculing, Bacolod City",
    contactNumbers: ["(034) 468-0341"],
    location: {
      latitude: 10.66,
      longitude: 122.962,
    },
    barangay: "Taculing",
  },
  {
    id: "7",
    name: "Police Station 7",
    address: "Barangay Mansilingan, Bacolod City",
    contactNumbers: ["(034) 446-2802"],
    location: {
      latitude: 10.655,
      longitude: 122.97,
    },
    barangay: "Mansilingan",
  },
  {
    id: "8",
    name: "Police Station 8",
    address: "Barangay Tangub, Bacolod City",
    contactNumbers: ["(034) 444-1593", "(034) 704-3133"],
    location: {
      latitude: 10.63,
      longitude: 122.96,
    },
    barangay: "Tangub",
  },
  {
    id: "9",
    name: "Police Station 9",
    address: "Barangay Sum-ag, Bacolod City",
    contactNumbers: ["(034) 444-3155"],
    location: {
      latitude: 10.61,
      longitude: 122.955,
    },
    barangay: "Sum-ag",
  },
];

// Emergency respondents data
const emergencyRespondents: EmergencyRespondentType[] = [
  {
    id: "e1",
    name: "Philippine Red Cross - Bacolod City Chapter",
    address: "Pnrc Building, 10th Street, Bacolod City, Negros Occidental",
    contactNumbers: ["(034) 434-8541", "(034) 434-9286"],
    location: {
      latitude: 10.67,
      longitude: 122.955,
    },
    type: "emergency",
  },
  {
    id: "e2",
    name: "Amity Emergency Services Foundation",
    address: "Amity Building, Hilado Extension, Bacolod City",
    contactNumbers: ["(034) 432-2161"],
    location: {
      latitude: 10.672,
      longitude: 122.956,
    },
    type: "emergency",
  },
  {
    id: "e3",
    name: "Disaster Risk Reduction and Management Office (DRRMO)",
    address: "2F City Hall Building, cor. Araneta-Luzuriaga Sts., Bacolod City",
    contactNumbers: [
      "(034) 432-3879",
      "(034) 445-7826",
      "(034) 432-3871",
      "0930-243-4706",
      "0936-940-1591",
    ],
    location: {
      latitude: 10.667,
      longitude: 122.953,
    },
    type: "emergency",
  },
];

// List of barangays for filtering
const barangays = [
  "Downtown",
  "Handumanan",
  "Mandalagan",
  "Villamonte",
  "Granada",
  "Taculing",
  "Mansilingan",
  "Tangub",
  "Sum-ag",
];

const PoliceStationsScreen = () => {
  // Get insets for safe area
  const insets = useSafeAreaInsets();

  // Get theme colors based on color scheme
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];

  // State declarations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<
    PoliceStationType | EmergencyRespondentType | null
  >(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEmergencyRespondents, setShowEmergencyRespondents] =
    useState<boolean>(false);

  // Initialize on component mount
  useEffect(() => {
    // Simulate data loading
    setIsLoading(false);
  }, []);

  // Function to toggle barangay filter
  const toggleBarangayFilter = (barangay: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedBarangays((prev) => {
      if (prev.includes(barangay)) {
        return prev.filter((b) => b !== barangay);
      } else {
        return [...prev, barangay];
      }
    });
  };

  // Function to filter stations based on search and barangay filters
  const getFilteredStations = useCallback(() => {
    let filteredPoliceStations = policeStations;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPoliceStations = filteredPoliceStations.filter(
        (station) =>
          station.name.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query) ||
          station.barangay.toLowerCase().includes(query),
      );
    }

    // Filter by selected barangays
    if (selectedBarangays.length > 0) {
      filteredPoliceStations = filteredPoliceStations.filter((station) =>
        selectedBarangays.includes(station.barangay),
      );
    }

    let itemsToShow: (PoliceStationType | EmergencyRespondentType)[] = [
      ...filteredPoliceStations,
    ];

    if (showEmergencyRespondents) {
      // If search query is active, filter emergency respondents as well
      let filteredEmergencyRespondents = emergencyRespondents;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEmergencyRespondents = emergencyRespondents.filter(
          (resp) =>
            resp.name.toLowerCase().includes(query) ||
            resp.address.toLowerCase().includes(query),
        );
      }
      itemsToShow = [...itemsToShow, ...filteredEmergencyRespondents];
    }
    return itemsToShow;
  }, [searchQuery, selectedBarangays, showEmergencyRespondents]);

  // Function to select a station and show details
  const selectStation = (
    station: PoliceStationType | EmergencyRespondentType,
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedStation(station);
    setDetailModalVisible(true);
  };

  // Function to call a station
  const callStation = (phoneNumber: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let formattedNumber = phoneNumber.replace(/\D/g, ""); // Remove non-digits

    // Format for phone links
    if (!formattedNumber.startsWith("+63")) {
      // Convert (034) format to +63 format
      formattedNumber =
        "+63" + formattedNumber.substring(formattedNumber.length - 10);
    }

    const url = `tel:${formattedNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
        Alert.alert("Error", "Phone calls are not supported on this device");
      })
      .catch((error) => {
        Alert.alert("Error", "An error occurred: " + error);
      });
  };

  // Render UI
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        style={colorScheme === "dark" ? "light" : "dark"}
        backgroundColor={theme.background}
      />

      <SearchHeader
        theme={theme}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchActive={setIsSearchActive}
      />

      {!isSearchActive && (
        <View style={styles.controlsContainer}>
          <BarangayFilters
            barangays={barangays}
            selectedBarangays={selectedBarangays}
            toggleBarangayFilter={toggleBarangayFilter}
            theme={theme}
          />
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              Show Emergency Respondents
            </Text>
            <Switch
              value={showEmergencyRespondents}
              onValueChange={setShowEmergencyRespondents}
              trackColor={{ false: theme.inactiveTab, true: theme.primary }}
              thumbColor={theme.card} // Simplified thumb color
            />
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredStations()}
          renderItem={({ item }) => (
            <StationCard
              item={item} // Pass the whole item
              theme={theme}
              distance={null} // No distance calculation
              isEmergency={item.type === "emergency"} // Check item type
              onCardPress={() => selectStation(item)}
              onCallPress={callStation}
              onDirectionsPress={() => {
                /* Directions removed */
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text
                style={[styles.emptyListText, { color: theme.textSecondary }]}
              >
                No stations or respondents found.
              </Text>
            </View>
          }
        />
      )}

      {selectedStation && (
        <StationDetailsModal
          visible={detailModalVisible}
          station={selectedStation} // Pass the whole item
          theme={theme}
          colorScheme={colorScheme || "light"} // Pass color scheme
          userLocation={null} // No user location
          onClose={() => setDetailModalVisible(false)}
          onCall={callStation}
          onDirections={() => {
            /* Directions removed */
          }}
          calculateDistance={() => null} // No distance calculation
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    paddingBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.light.border, // Default to light, or use theme.border
  },
  switchLabel: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
  },
});

export default PoliceStationsScreen;
