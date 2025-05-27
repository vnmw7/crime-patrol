import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import police station data from the constants file
import {
  policeStations as policeStationsData,
  emergencyRespondents,
  barangays as barangayNames,
} from "../constants/policeStationsData";

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

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type PoliceStationType = {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  phone: string;
};

type IncidentType = {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  date: string;
  type: string;
  reportedBy: string;
};

type BarangayType = {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number }[];
  color: string;
};

// Initial region (Bacolod City)
const initialRegion: LocationType = {
  latitude: 10.6713,
  longitude: 122.9511,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Mock data for incidents (recent reports)
const recentIncidents: IncidentType[] = [
  {
    id: "1",
    title: "Theft Report",
    description: "A smartphone was stolen at a local café.",
    location: {
      latitude: 10.6721,
      longitude: 122.949,
    },
    date: "2025-03-23T14:30:00",
    type: "theft",
    reportedBy: "Anonymous",
  },
  {
    id: "2",
    title: "Suspicious Activity",
    description: "Unknown persons loitering around closed establishments.",
    location: {
      latitude: 10.678,
      longitude: 122.952,
    },
    date: "2025-03-24T23:15:00",
    type: "suspicious",
    reportedBy: "Community Watch",
  },
];

// Mock data for 3 barangays in Bacolod
const barangays: BarangayType[] = [
  {
    id: "1",
    name: "Villamonte",
    coordinates: [
      { latitude: 10.668, longitude: 122.944 },
      { latitude: 10.672, longitude: 122.944 },
      { latitude: 10.672, longitude: 122.948 },
      { latitude: 10.668, longitude: 122.948 },
    ],
    color: "rgba(255, 0, 0, 0.2)",
  },
  {
    id: "2",
    name: "Mandalagan",
    coordinates: [
      { latitude: 10.68, longitude: 122.952 },
      { latitude: 10.684, longitude: 122.952 },
      { latitude: 10.684, longitude: 122.956 },
      { latitude: 10.68, longitude: 122.956 },
    ],
    color: "rgba(0, 255, 0, 0.2)",
  },
  {
    id: "3",
    name: "Alijis",
    coordinates: [
      { latitude: 10.658, longitude: 122.962 },
      { latitude: 10.662, longitude: 122.962 },
      { latitude: 10.662, longitude: 122.966 },
      { latitude: 10.658, longitude: 122.966 },
    ],
    color: "rgba(0, 0, 255, 0.2)",
  },
];

// Type for our report form
type ReportFormType = {
  title: string;
  description: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  media: string[]; // This would actually store URIs to media files
};

// Fix the implicit 'any' type for the 'emergency' parameter
const showEmergencyDetails = (emergency: {
  name: string;
  address: string;
  contactNumbers: string[];
}) => {
  Alert.alert(
    "Emergency Details",
    `Name: ${emergency.name}\nAddress: ${emergency.address}\nPhone: ${emergency.contactNumbers[0] || "N/A"}`,
    [{ text: "OK" }],
  );
};

// Main Map component
const MapScreen = () => {
  // State declarations
  const [region, setRegion] = useState<LocationType>(initialRegion);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStation, setSelectedStation] =
    useState<PoliceStationType | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>(
    null,
  );
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] =
    useState<boolean>(false);
  const [reportForm, setReportForm] = useState<ReportFormType>({
    title: "",
    description: "",
    type: "theft", // Default type
    location: null,
    media: [],
  });
  const [reportLocation, setReportLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<"form" | "media">("form");
  // Get theme colors based on color scheme
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Reference to the map
  const mapRef = useRef<WebView>(null);

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
      }

      // Add a timeout for getCurrentPositionAsync
      const locationPromise = Location.getCurrentPositionAsync({});
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Location request timed out after 15 seconds")),
          15000,
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
      // Use functional update for setRegion
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
      }));

      // Animate to user's location
      mapRef.current?.injectJavaScript(`
        map.setView([${userLoc.latitude}, ${userLoc.longitude}], 15);
      `);
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
  }, [mapRef, setRegion, setUserLocation]); // Keep dependencies minimal
  // Initialize on component mount
  useEffect(() => {
    getUserLocation();
    // getUserLocation dependency is correct now with its refined dependencies
  }, [getUserLocation]);

  // Navigation function
  const navigateToMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/menu" as any);
  };

  // Handle opening the report form
  const handleReportLocation = (event: any) => {
    const { coordinate } = event.nativeEvent;

    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setReportLocation(coordinate);
    setReportForm({
      ...reportForm,
      location: coordinate,
    });
    setReportModalVisible(true);
  };

  // Handle submitting a report
  const handleSubmitReport = () => {
    // Here you would normally send the data to your backend
    console.log("Report submitted:", reportForm);

    // For now, just close the modal and reset form
    setReportModalVisible(false);
    setReportForm({
      title: "",
      description: "",
      type: "theft",
      location: null,
      media: [],
    });
    setReportLocation(null);

    // Show success message
    Alert.alert(
      "Report Submitted",
      "Thank you for your report. It will be reviewed by our team.",
      [{ text: "OK" }],
    );
  };

  // Function to show station details
  const showStationDetails = (station: PoliceStationType) => {
    setSelectedStation(station);
    setSelectedIncident(null);
    setDetailsModalVisible(true);
  };

  // Function to show incident details
  const showIncidentDetails = (incident: IncidentType) => {
    setSelectedIncident(incident);
    setSelectedStation(null);
    setDetailsModalVisible(true);
  };

  // Fix the missing 'phone' property in the police station object
  const updatedPoliceStations = policeStationsData.map((station) => ({
    ...station,
    phone: station.contactNumbers[0] || "N/A",
  }));
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
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Extracted Map Component */}
      <MapComponent
        mapRef={mapRef}
        updatedPoliceStations={updatedPoliceStations}
        emergencyRespondents={emergencyRespondents}
        recentIncidents={recentIncidents}
        handleReportLocation={handleReportLocation}
        showStationDetails={showStationDetails}
        showEmergencyDetails={showEmergencyDetails}
        showIncidentDetails={showIncidentDetails}
      />

      {/* Extracted Controls, Modals, and Other UI */}
      <MapControls
        getUserLocation={getUserLocation}
        userLocation={userLocation}
        setReportLocation={setReportLocation}
        setReportForm={setReportForm}
        setReportModalVisible={setReportModalVisible}
        reportForm={reportForm}
        theme={theme}
      />

      <Legend theme={theme} />
      <InfoBanner theme={theme} />
      {isLoading && <LoadingIndicator theme={theme} />}
      <ReportModal
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        reportForm={reportForm}
        setReportForm={setReportForm}
        handleSubmitReport={handleSubmitReport}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        theme={theme}
      />
      <DetailsModal
        detailsModalVisible={detailsModalVisible}
        setDetailsModalVisible={setDetailsModalVisible}
        selectedStation={selectedStation}
        selectedIncident={selectedIncident}
        setReportLocation={setReportLocation}
        setReportForm={setReportForm}
        setReportModalVisible={setReportModalVisible}
        theme={theme}
      />
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
    top: 40, // Adjusted to avoid status bar
    backgroundColor: "transparent",
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
});

// Define prop types for extracted components
interface MapComponentProps {
  mapRef: React.RefObject<WebView>;
  updatedPoliceStations: PoliceStationType[];
  emergencyRespondents: any[]; // Replace 'any' with a specific type if available
  recentIncidents: IncidentType[];
  handleReportLocation: (event: any) => void;
  showStationDetails: (station: PoliceStationType) => void;
  showEmergencyDetails: (emergency: any) => void; // Replace 'any' with a specific type
  showIncidentDetails: (incident: IncidentType) => void;
}

interface MapControlsProps {
  getUserLocation: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  setReportLocation: React.Dispatch<
    React.SetStateAction<{ latitude: number; longitude: number } | null>
  >;
  setReportForm: React.Dispatch<React.SetStateAction<ReportFormType>>;
  setReportModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  reportForm: ReportFormType;
  theme: any; // Replace 'any' with a specific theme type
}

interface LegendProps {
  theme: any; // Replace 'any' with a specific theme type
}

interface InfoBannerProps {
  theme: any; // Replace 'any' with a specific theme type
}

interface LoadingIndicatorProps {
  theme: any; // Replace 'any' with a specific theme type
}

interface ReportModalProps {
  reportModalVisible: boolean;
  setReportModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  reportForm: ReportFormType;
  setReportForm: React.Dispatch<React.SetStateAction<ReportFormType>>;
  handleSubmitReport: () => void;
  selectedTab: "form" | "media";
  setSelectedTab: React.Dispatch<React.SetStateAction<"form" | "media">>;
  theme: any; // Replace 'any' with a specific theme type
}

interface DetailsModalProps {
  detailsModalVisible: boolean;
  setDetailsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStation: PoliceStationType | null;
  selectedIncident: IncidentType | null;
  setReportLocation: React.Dispatch<
    React.SetStateAction<{ latitude: number; longitude: number } | null>
  >;
  setReportForm: React.Dispatch<React.SetStateAction<ReportFormType>>;
  setReportModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  theme: any; // Replace 'any' with a specific theme type
}

// Define the missing components
const MapComponent: React.FC<MapComponentProps> = ({
  mapRef,
  updatedPoliceStations,
  emergencyRespondents,
  recentIncidents,
  handleReportLocation,
  showStationDetails,
  showEmergencyDetails,
  showIncidentDetails,
}) => {
  return (
    <WebView
      ref={mapRef}
      style={styles.map}
      source={{
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            #map { height: 100%; width: 100%; }
            html, body { height: 100%; margin: 0; padding: 0; }
          </style>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([10.6713, 122.9511], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
          </script>
        </body>
        </html>
        `,
      }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === "station_selected") {
            const station = updatedPoliceStations.find(
              (s: PoliceStationType) => s.id === data.id,
            );
            if (station) {
              showStationDetails(station);
            }
          } else if (data.type === "emergency_selected") {
            // Add type for emergency respondent if available
            const emergency = emergencyRespondents.find(
              (e: any) => e.id === data.id,
            );
            if (emergency) {
              showEmergencyDetails(emergency);
            }
          } else if (data.type === "incident_selected") {
            const incident = recentIncidents.find(
              (i: IncidentType) => i.id === data.id,
            );
            if (incident) {
              showIncidentDetails(incident);
            }
          } else if (data.type === "long_press") {
            handleReportLocation({
              nativeEvent: {
                coordinate: data.latLng,
              },
            });
          }
        } catch (e) {
          console.error("Error parsing WebView message:", e);
        }
      }}
    />
  );
};

const MapControls: React.FC<MapControlsProps> = ({
  getUserLocation,
  userLocation,
  setReportLocation,
  setReportForm,
  setReportModalVisible,
  reportForm,
  theme,
}) => {
  return (
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
    </View>
  );
};

const Legend: React.FC<LegendProps> = ({ theme }) => {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "blue" }]} />
        <Text style={[styles.legendText, { color: theme.text }]}>
          Police Station
        </Text>
      </View>
    </View>
  );
};

const InfoBanner: React.FC<InfoBannerProps> = ({ theme }) => {
  return (
    <View style={styles.infoBanner}>
      <Text style={styles.infoText}>
        Press and hold on the map to report an incident at that location
      </Text>
    </View>
  );
};

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

const ReportModal: React.FC<ReportModalProps> = ({
  reportModalVisible,
  setReportModalVisible,
  reportForm,
  setReportForm,
  handleSubmitReport,
  selectedTab,
  setSelectedTab,
  theme,
}) => {
  return null; // Placeholder for the modal implementation
};

const DetailsModal: React.FC<DetailsModalProps> = ({
  detailsModalVisible,
  setDetailsModalVisible,
  selectedStation,
  selectedIncident,
  setReportLocation,
  setReportForm,
  setReportModalVisible,
  theme,
}) => {
  return null; // Placeholder for the modal implementation
};
