import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  Linking,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  // Function to calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

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

  // Function to render a police station card
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

    const isEmergencyRespondent = "type" in item;

    return (
      <TouchableOpacity
        style={[
          styles.stationCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          isEmergencyRespondent && styles.emergencyCard,
        ]}
        onPress={() =>
          !isEmergencyRespondent && selectStation(item as PoliceStationType)
        }
        activeOpacity={0.7}
      >
        <View style={styles.stationCardHeader}>
          <View style={styles.stationNameContainer}>
            <View style={styles.stationIcon}>
              {isEmergencyRespondent ? (
                <MaterialCommunityIcons
                  name="ambulance"
                  size={20}
                  color={theme.secondary}
                />
              ) : (
                <MaterialIcons
                  name="local-police"
                  size={20}
                  color={theme.primary}
                />
              )}
            </View>
            <Text
              style={[
                styles.stationName,
                { color: theme.text },
                isEmergencyRespondent && { color: theme.secondary },
              ]}
            >
              {item.name}
            </Text>
          </View>
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {distance < 1
                  ? `${(distance * 1000).toFixed(0)}m`
                  : `${distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.addressContainer}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>
            {item.address}
          </Text>
        </View>

        <View style={styles.contactContainer}>
          <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.contactText, { color: theme.textSecondary }]}>
            {item.contactNumbers[0]}
            {item.contactNumbers.length > 1 &&
              ` +${item.contactNumbers.length - 1} more`}
          </Text>
        </View>

        <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => callStation(item.contactNumbers[0])}
          >
            <Ionicons name="call" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              Call
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.actionDivider, { backgroundColor: theme.border }]}
          />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => getDirections(item as PoliceStationType)}
          >
            <Ionicons name="navigate" size={20} color={theme.tertiary} />
            <Text style={[styles.actionText, { color: theme.tertiary }]}>
              Directions
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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

      {/* View toggle and filter controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "list" && [
                styles.activeViewToggleButton,
                { backgroundColor: theme.primary },
              ],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode("list");
            }}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "list" ? "#FFFFFF" : theme.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                { color: viewMode === "list" ? "#FFFFFF" : theme.text },
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "map" && [
                styles.activeViewToggleButton,
                { backgroundColor: theme.primary },
              ],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode("map");
              // Ensure map fits all stations when switching to map view
              setTimeout(fitMapToStations, 300);
            }}
          >
            <Ionicons
              name="map"
              size={20}
              color={viewMode === "map" ? "#FFFFFF" : theme.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                { color: viewMode === "map" ? "#FFFFFF" : theme.text },
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency respondents toggle */}
        <TouchableOpacity
          style={[
            styles.emergencyToggle,
            showEmergencyRespondents && [
              styles.activeEmergencyToggle,
              { backgroundColor: theme.secondary },
            ],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowEmergencyRespondents(!showEmergencyRespondents);
          }}
        >
          <MaterialCommunityIcons
            name="ambulance"
            size={16}
            color={showEmergencyRespondents ? "#FFFFFF" : theme.secondary}
          />
          <Text
            style={[
              styles.emergencyToggleText,
              {
                color: showEmergencyRespondents ? "#FFFFFF" : theme.secondary,
              },
            ]}
          >
            Emergency
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barangay filters */}
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
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={theme.textSecondary}
              />
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
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            onMapReady={fitMapToStations}
          >
            {/* Render Station Markers */}
            {filteredStations.map((station) => {
              const isEmergencyRespondent = "type" in station;

              return (
                <Marker
                  key={station.id}
                  coordinate={station.location}
                  title={station.name}
                  description={station.address}
                  pinColor={isEmergencyRespondent ? "red" : "blue"}
                  onPress={() =>
                    !isEmergencyRespondent &&
                    selectStation(station as PoliceStationType)
                  }
                >
                  <Callout tooltip>
                    <View
                      style={[
                        styles.calloutContainer,
                        {
                          backgroundColor: theme.calloutBackground,
                          borderColor: theme.calloutBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.calloutTitle, { color: theme.text }]}
                      >
                        {station.name}
                      </Text>
                      <Text
                        style={[
                          styles.calloutDescription,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {station.address}
                      </Text>
                      <Text
                        style={[styles.calloutPhone, { color: theme.primary }]}
                      >
                        {station.contactNumbers[0]}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[
                styles.mapButton,
                { backgroundColor: theme.mapControlBackground },
              ]}
              onPress={getUserLocation}
            >
              <Ionicons name="locate" size={24} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mapButton,
                { backgroundColor: theme.mapControlBackground },
              ]}
              onPress={fitMapToStations}
            >
              <Ionicons name="expand" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalBlur}>
          {selectedStation && (
            <View
              style={[
                styles.detailsContainer,
                {
                  backgroundColor: theme.card,
                  shadowColor: colorScheme === "dark" ? "#000" : "#333",
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedStation.name}
                </Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.detailsContent}>
                  <View style={styles.detailsItem}>
                    <Ionicons
                      name="location"
                      size={24}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.detailsText, { color: theme.text }]}>
                      {selectedStation.address}
                    </Text>
                  </View>

                  <View style={styles.detailsItem}>
                    <Ionicons
                      name="business"
                      size={24}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.detailsText, { color: theme.text }]}>
                      Barangay {selectedStation.barangay}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.contactSection,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Contact Information
                    </Text>

                    {selectedStation.contactNumbers.map((number, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.contactItem}
                        onPress={() => callStation(number)}
                      >
                        <Ionicons name="call" size={20} color={theme.primary} />
                        <Text
                          style={[
                            styles.contactItemText,
                            { color: theme.primary },
                          ]}
                        >
                          {number}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.mapSection,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Location
                    </Text>

                    <View style={styles.miniMapContainer}>
                      <MapView
                        style={styles.miniMap}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                          latitude: selectedStation.location.latitude,
                          longitude: selectedStation.location.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                      >
                        <Marker
                          coordinate={selectedStation.location}
                          pinColor="blue"
                        />
                      </MapView>
                    </View>

                    {userLocation && (
                      <View style={styles.distanceInfo}>
                        <Ionicons
                          name="navigate"
                          size={20}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.distanceInfoText,
                            { color: theme.text },
                          ]}
                        >
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            selectedStation.location.latitude,
                            selectedStation.location.longitude,
                          )?.toFixed(2)}{" "}
                          km away from your location
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.servicesSection,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Services
                    </Text>

                    <View style={styles.servicesList}>
                      <View style={styles.serviceItem}>
                        <Ionicons
                          name="document-text"
                          size={20}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[styles.serviceText, { color: theme.text }]}
                        >
                          File a Police Report
                        </Text>
                      </View>

                      <View style={styles.serviceItem}>
                        <Ionicons
                          name="shield"
                          size={20}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[styles.serviceText, { color: theme.text }]}
                        >
                          Police Assistance
                        </Text>
                      </View>

                      <View style={styles.serviceItem}>
                        <Ionicons
                          name="finger-print"
                          size={20}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[styles.serviceText, { color: theme.text }]}
                        >
                          Criminal Investigation
                        </Text>
                      </View>

                      <View style={styles.serviceItem}>
                        <Ionicons
                          name="people"
                          size={20}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[styles.serviceText, { color: theme.text }]}
                        >
                          Community Service
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    setDetailModalVisible(false);
                    callStation(selectedStation.contactNumbers[0]);
                  }}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.footerButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    { backgroundColor: theme.tertiary },
                  ]}
                  onPress={() => {
                    setDetailModalVisible(false);
                    getDirections(selectedStation);
                  }}
                >
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.footerButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BlurView>
      </Modal>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeViewToggleButton: {
    backgroundColor: "#0095F6",
  },
  viewToggleText: {
    marginLeft: 4,
    fontWeight: "600",
  },
  emergencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  activeEmergencyToggle: {
    backgroundColor: "#FF3B30",
    borderColor: "transparent",
  },
  emergencyToggleText: {
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 12,
  },
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
  stationCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  stationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stationNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stationIcon: {
    marginRight: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  actionDivider: {
    width: 1,
    height: "100%",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "transparent",
  },
  mapButton: {
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  calloutPhone: {
    fontSize: 12,
    fontWeight: "500",
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
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  detailsContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // Extra padding for iOS
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
  },
  detailsContent: {
    marginBottom: 16,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailsText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  contactSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  mapSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  miniMapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  servicesSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceText: {
    marginLeft: 10,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 16,
  },
});

export default PoliceStationsScreen;
