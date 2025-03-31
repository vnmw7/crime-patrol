import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Linking,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// App components
import SearchHeader from "../components/police-stations/SearchHeader";
import ViewToggleControls from "../components/police-stations/ViewToggleControls";
import BarangayFilters from "../components/police-stations/BarangayFilters";
import StationCard from "../components/police-stations/StationCard";
import MapViewComponent from "../components/police-stations/MapViewComponent";
import StationDetailsModal from "../components/police-stations/StationDetailsModal";

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
type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type PoliceStationType = {
  id: string;
  name: string;
  address: string;
  contactNumbers: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  barangay: string;
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

// Initial region (Bacolod City)
const initialRegion: LocationType = {
  latitude: 10.6713,
  longitude: 122.9511,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] =
    useState<PoliceStationType | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [region, setRegion] = useState<LocationType>(initialRegion);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showEmergencyRespondents, setShowEmergencyRespondents] =
    useState<boolean>(false);

  // Reference to the map
  const mapRef = useRef<MapView>(null);

  // Function to get user's location
  const getUserLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant location permission to use all features.",
          [{ text: "OK" }],
        );
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userLoc);
      setRegion({
        ...region,
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
      });

      // Animate to user's location if in map view
      if (viewMode === "map" && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location.");
    } finally {
      setIsLoading(false);
    }
  }, [region, viewMode]);

  // Initialize on component mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

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
    let filtered = policeStations;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query) ||
          station.barangay.toLowerCase().includes(query),
      );
    }

    // Filter by selected barangays
    if (selectedBarangays.length > 0) {
      filtered = filtered.filter((station) =>
        selectedBarangays.includes(station.barangay),
      );
    }

    // Add emergency respondents if needed
    return showEmergencyRespondents
      ? [...filtered, ...emergencyRespondents]
      : filtered;
  }, [searchQuery, selectedBarangays, showEmergencyRespondents]);

  // Function to select a station and show details
  const selectStation = (station: PoliceStationType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedStation(station);
    setDetailModalVisible(true);
  };

  // Function to get directions to a station
  const getDirections = (station: PoliceStationType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { latitude, longitude } = station.location;
    const label = encodeURIComponent(station.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
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

  // Function to check if coordinates are valid
  const areCoordinatesValid = (lat: number, lon: number): boolean => {
    return (
      lat !== undefined && lat !== null && lon !== undefined && lon !== null
    );
  };

  // Function to calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    // Check if all coordinates are valid
    if (!areCoordinatesValid(lat1, lon1) || !areCoordinatesValid(lat2, lon2)) {
      return null;
    }

    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Function to center the map on all visible stations
  const fitMapToStations = () => {
    if (!mapRef.current) return;

    const filteredStations = getFilteredStations();
    if (filteredStations.length === 0) return;

    mapRef.current.fitToCoordinates(
      filteredStations.map((station) => station.location),
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      },
    );
  };

  // Determine if a station is an emergency respondent
  const isEmergencyRespondent = (
    item: PoliceStationType | EmergencyRespondentType,
  ): boolean => {
    return "type" in item;
  };

  // Function to render a police station or emergency respondent card
  const renderStationCard = ({
    item,
  }: {
    item: PoliceStationType | EmergencyRespondentType;
  }) => {
    // Calculate distance to the station if user location is available
    let distance = null;
    if (userLocation) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.location.latitude,
        item.location.longitude,
      );
    }

    const isEmergency = isEmergencyRespondent(item);

    return (
      <StationCard
        item={item}
        theme={theme}
        distance={distance}
        isEmergency={isEmergency}
        onCardPress={() =>
          !isEmergency && selectStation(item as PoliceStationType)
        }
        onCallPress={callStation}
        onDirectionsPress={() => getDirections(item as PoliceStationType)}
      />
    );
  };

  // Get filtered stations for rendering
  const filteredStations = getFilteredStations();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <SearchHeader
        theme={theme}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchActive={setIsSearchActive}
      />

      {/* View toggle and filter controls */}
      <ViewToggleControls
        theme={theme}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showEmergencyRespondents={showEmergencyRespondents}
        setShowEmergencyRespondents={setShowEmergencyRespondents}
        fitMapToStations={fitMapToStations}
      />

      {/* Barangay filters */}
      <BarangayFilters
        theme={theme}
        barangays={barangays}
        selectedBarangays={selectedBarangays}
        toggleBarangayFilter={toggleBarangayFilter}
      />

      {/* Results counter */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.textSecondary }]}>
          {filteredStations.length}{" "}
          {filteredStations.length === 1 ? "result" : "results"} found
        </Text>
      </View>

      {/* List View */}
      {viewMode === "list" && (
        <FlatList
          data={filteredStations}
          renderItem={renderStationCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.stationList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No police stations found
              </Text>
              <Text
                style={[styles.emptySubtext, { color: theme.textSecondary }]}
              >
                Try adjusting your filters or search query
              </Text>
            </View>
          }
        />
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <MapViewComponent
          mapRef={mapRef}
          theme={theme}
          region={region}
          stations={filteredStations}
          isEmergencyRespondent={isEmergencyRespondent}
          onMarkerPress={selectStation}
          getUserLocation={getUserLocation}
          fitMapToStations={fitMapToStations}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View
          style={[styles.loadingContainer, { backgroundColor: theme.overlay }]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading...
          </Text>
        </View>
      )}

      {/* Station Details Modal */}
      <StationDetailsModal
        visible={detailModalVisible}
        station={selectedStation}
        theme={theme}
        colorScheme={colorScheme || "light"}
        userLocation={userLocation}
        onClose={() => setDetailModalVisible(false)}
        onCall={callStation}
        onDirections={getDirections}
        calculateDistance={calculateDistance}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 12,
  },
  stationList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
});

export default PoliceStationsScreen;
