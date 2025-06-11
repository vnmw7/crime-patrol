import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { dictLocationPing } from "../types/types_location";

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

const { height } = Dimensions.get("window");

// Define a type for the user location
interface UserLocation {
  latitude: number;
  longitude: number;
}

// Define the interface for an emergency ping
interface EmergencyPing {
  id: string; // Unique identifier for the ping
  latitude: number;
  longitude: number;
  description?: string; // Optional description
  timestamp: number; // When it was received/created
}

// Main Map component
const MapScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setUserLocation] = useState<UserLocation | null>(null); // Mark userLocation as unused
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyPings, setEmergencyPings] = useState<EmergencyPing[]>([]); // State for emergency pings
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getBackendUrl = () => {
    if (__DEV__) {
      if (Platform.OS === "android") {
        return "http://192.168.254.120:3000";
      } else {
        return "http://192.168.254.120:3000";
      }
    } else {
      return "https://your-production-backend.com";
    }
  };

  // Function to get user's location
  const getUserLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant location permission to use this feature.",
          [{ text: "OK" }],
        );
        // No need to set isLoading false here, finally block handles it
        return;
      }

      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services on your device to use this feature.",
          [{ text: "OK" }],
        );
        // No need to set isLoading false here, finally block handles it
        return;
      } // Add a timeout for getCurrentPositionAsync with more permissive options
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Location request timed out after 30 seconds")),
          30000,
        ),
      );

      // Wait for either location or timeout
      const locationResult = await Promise.race([
        locationPromise,
        timeoutPromise,
      ]);

      // Type guard to check if locationResult is a LocationObject
      if (
        !locationResult ||
        !(locationResult as Location.LocationObject).coords
      ) {
        throw new Error("Failed to get valid location coordinates.");
      }

      // Cast to LocationObject after the check
      const location = locationResult as Location.LocationObject;

      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userLoc);

      console.log(
        `User location acquired: ${userLoc.latitude}, ${userLoc.longitude}`,
      );
    } catch (error) {
      console.error("Error getting location:", error);
      // Type check for error message
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get your location. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false); // Ensure loading is always stopped
    }
  }, []);

  const connectToSocket = useCallback(() => {
    if (isConnecting || isConnected) {
      return;
    }

    const backendUrl = getBackendUrl();
    console.log(`[PanicButton] Connecting to: ${backendUrl}`);
    setIsConnecting(true);

    const newSocket = io(backendUrl, {
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[PanicButton] Connected to socket server");
      setIsConnected(true);
      setIsConnecting(false);

      newSocket.emit("join-emergency-services");
    });

    newSocket.on("disconnect", () => {
      console.log("[PanicButton] Disconnected from socket server");
      setIsConnected(false);
      setIsConnecting(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[PanicButton] Connection error:", error);
      setIsConnecting(false);
      setIsConnected(false);
    });
    newSocket.on("emergency-alert", (dictLocationData: dictLocationPing) => {
      console.log("[MapScreen] Emergency alert received:", dictLocationData);
      // Ensure data is valid and has latitude and longitude
      if (
        dictLocationData &&
        typeof dictLocationData.dblLatitude === "number" &&
        typeof dictLocationData.dblLongitude === "number"
      ) {
        const newPing: EmergencyPing = {
          id: `ping-${dictLocationData.strReporterId}-${new Date().getTime()}`, // Generate ID using reporter ID
          latitude: dictLocationData.dblLatitude,
          longitude: dictLocationData.dblLongitude,
          description: "", // Not available in dictLocationPing
          timestamp: new Date().getTime(),
        };
        setEmergencyPings((prevPings) => {
          // Avoid adding duplicate pings by checking if a ping with same coordinates and reporter already exists
          const isDuplicate = prevPings.find(
            (p) =>
              p.latitude === newPing.latitude &&
              p.longitude === newPing.longitude &&
              p.id.includes(dictLocationData.strReporterId),
          );
          if (isDuplicate) {
            return prevPings;
          }
          return [...prevPings, newPing];
        });
      } else {
        console.warn(
          "[MapScreen] Received emergency-alert with invalid data structure:",
          dictLocationData,
        );
      }
    });

    setSocket(newSocket);
  }, [isConnecting, isConnected]); // Add isConnecting and isConnected to dependencies
  useEffect(() => {
    getUserLocation();
    connectToSocket();
  }, [getUserLocation, connectToSocket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Add socket to dependencies

  // Navigation function
  const navigateToMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/menu" as any);
  };

  // Provide haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.border,
            backgroundColor: theme.card,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={navigateToMenu}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={30} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Map</Text>
          <View style={styles.headerSpacer} />{" "}
        </View>
      </View>
      {/* Map Placeholder */}
      <View
        style={[styles.mapContainer, { backgroundColor: theme.background }]}
      >
        {/* Location Button */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[
              styles.mapButton,
              { backgroundColor: theme.mapControlBackground },
            ]}
            onPress={getUserLocation}
            accessibilityLabel="Get current location"
            accessibilityRole="button"
          >
            <Ionicons
              name="locate"
              size={24}
              color={isLoading ? theme.primary : theme.text}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.mapPlaceholder, { borderColor: theme.border }]}>
          <Ionicons name="map" size={48} color={theme.textSecondary} />
          <Text
            style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}
          >
            Map View
          </Text>
          <Text style={[styles.mapSubtext, { color: theme.textSecondary }]}>
            {emergencyPings.length > 0
              ? `${emergencyPings.length} Emergency Alert${emergencyPings.length !== 1 ? "s" : ""}`
              : "No emergency alerts"}
          </Text>

          {/* Emergency Pings List */}
          {emergencyPings.length > 0 && (
            <ScrollView
              style={styles.pingsList}
              showsVerticalScrollIndicator={false}
            >
              {emergencyPings.map((ping) => (
                <View
                  key={ping.id}
                  style={[
                    styles.pingItem,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.pingHeader}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.secondary}
                    />
                    <Text style={[styles.pingId, { color: theme.text }]}>
                      Alert {ping.id.substring(0, 8)}...
                    </Text>
                  </View>
                  <Text
                    style={[styles.pingCoords, { color: theme.textSecondary }]}
                  >
                    {ping.latitude.toFixed(4)}, {ping.longitude.toFixed(4)}
                  </Text>
                  {ping.description && (
                    <Text
                      style={[styles.pingDescription, { color: theme.text }]}
                    >
                      {ping.description}
                    </Text>
                  )}
                  <Text
                    style={[styles.pingTime, { color: theme.textSecondary }]}
                  >
                    {new Date(ping.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
      {isLoading && <LoadingIndicator theme={theme} />}
    </View>
  );
};

export default MapScreen;

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  menuButton: {
    paddingRight: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSpacer: {
    width: 40, // Same width as menu button to center the title
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 12,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 16, // Positioned at the bottom of the map container
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  mapButton: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legend: {
    position: "absolute",
    bottom: 120,
    left: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
  infoBanner: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  infoText: {
    color: "white",
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // Extra padding for iOS
    height: height * 0.8, // 80% of screen height
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
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007bff",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  typeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  activeTypeButton: {
    backgroundColor: "#007bff",
  },
  typeButtonText: {
    color: "#333",
    textAlign: "center",
  },
  mediaContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  mediaSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  mediaButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    alignItems: "center",
  },
  mediaButtonText: {
    color: "#333",
    textAlign: "center",
  },
  mediaPreviewContainer: {
    marginTop: 16,
  },
  mediaPreviewText: {
    fontSize: 14,
    color: "#333",
  },
  emptyMedia: {
    alignItems: "center",
    marginTop: 16,
  },
  emptyMediaText: {
    color: "#666",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContent: {
    marginBottom: 16,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsText: {
    marginLeft: 8,
    color: "#333",
  },
  detailsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 8,
    color: "#007bff",
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  calloutPhone: {
    fontSize: 14,
    color: "#007bff",
  },
  calloutDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  emergencyStatus: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  emergencyStatusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emergencyPingItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  emergencyPingId: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emergencyPingStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  emergencyPingCoords: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#666",
    marginTop: 1,
  },
  emergencyStatusMore: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  emergencyStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 24,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  pingsList: {
    maxHeight: 200,
    width: "100%",
    marginTop: 16,
  },
  pingItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  pingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pingId: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  pingCoords: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  pingDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  pingTime: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

interface LoadingIndicatorProps {
  theme: any; // Replace 'any' with a specific theme type
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ theme }) => {
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.overlay }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.text }]}>
        Getting your location...
      </Text>
    </View>
  );
};
