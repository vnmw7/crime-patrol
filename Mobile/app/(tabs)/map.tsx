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
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

// Import police station data from the constants file
import {
  policeStations,
  emergencyRespondents,
  barangays as barangayNames,
} from "../constants/policeStationsData";

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

// The width and height of the screen
const { height } = Dimensions.get("window");

// Define types for the application
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

// Main Map component
export default function MapScreen() {
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

      // Animate to user's location
      mapRef.current?.injectJavaScript(`
        map.setView([${userLoc.latitude}, ${userLoc.longitude}], 15);
      `);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location.");
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  // Initialize on component mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

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

  const getIncidentMarkerColor = (type: string) => {
    switch (type) {
      case "theft":
        return "red";
      case "suspicious":
        return "orange";
      default:
        return "yellow";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* The Map Component */}
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
              .leaflet-popup-content-wrapper {
                border-radius: 8px;
                padding: 0;
              }
              .popup-content {
                padding: 10px;
              }
              .popup-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .popup-address, .popup-phone {
                margin-bottom: 3px;
                font-size: 0.9em;
              }
              .incident-popup {
                padding: 10px;
              }
              .incident-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .incident-desc {
                margin-bottom: 5px;
                font-size: 0.9em;
              }
              .incident-date {
                font-size: 0.8em;
                color: #666;
              }
            </style>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          </head>
          <body>
            <div id="map"></div>
            <script>
              // Initialize map (Bacolod City)
              var map = L.map('map').setView([10.6713, 122.9511], 13);
              
              // Add OpenStreetMap tiles
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
              }).addTo(map);
              
              // Police station icon
              var policeIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              // Emergency icon
              var emergencyIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              // Theft incident icon
              var theftIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              // Suspicious incident icon
              var suspiciousIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              // Add police stations markers
              const policeStations = ${JSON.stringify(policeStations)};
              policeStations.forEach(station => {
                let marker = L.marker([station.location.latitude, station.location.longitude], {icon: policeIcon})
                  .addTo(map);
                  
                marker.bindPopup(\`
                  <div class="popup-content">
                    <div class="popup-title">\${station.name}</div>
                    <div class="popup-address">\${station.address}</div>
                    <div class="popup-phone">\${station.contactNumbers[0]}</div>
                  </div>
                \`);
                
                marker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'station_selected',
                    id: station.id
                  }));
                });
              });
              
              // Add emergency respondents
              const emergencyRespondents = ${JSON.stringify(emergencyRespondents)};
              emergencyRespondents.forEach(respondent => {
                let marker = L.marker([respondent.location.latitude, respondent.location.longitude], {icon: emergencyIcon})
                  .addTo(map);
                  
                marker.bindPopup(\`
                  <div class="popup-content">
                    <div class="popup-title">\${respondent.name}</div>
                    <div class="popup-address">\${respondent.address}</div>
                    <div class="popup-phone">\${respondent.contactNumbers[0]}</div>
                  </div>
                \`);
                
                marker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'emergency_selected',
                    id: respondent.id
                  }));
                });
              });
              
              // Add incident markers
              const incidents = ${JSON.stringify(recentIncidents) || "[]"};
              incidents.forEach(incident => {
                let icon = incident.type === 'theft' ? theftIcon : suspiciousIcon;
                let marker = L.marker([incident.location.latitude, incident.location.longitude], {icon: icon})
                  .addTo(map);
                  
                marker.bindPopup(\`
                  <div class="incident-popup">
                    <div class="incident-title">\${incident.title}</div>
                    <div class="incident-desc">\${incident.description}</div>
                    <div class="incident-date">\${new Date(incident.date).toLocaleString()}</div>
                  </div>
                \`);
                
                marker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'incident_selected',
                    id: incident.id
                  }));
                });
              });
              
              // Handle long press for reporting
              let pressTimer;
              let pressStart;
              
              map.on('mousedown touchstart', function(e) {
                pressStart = e.latlng;
                pressTimer = setTimeout(function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'long_press',
                    latLng: {
                      latitude: e.latlng.lat,
                      longitude: e.latlng.lng
                    }
                  }));
                }, 1000);
              });
              
              map.on('mouseup mouseleave touchend touchcancel', function() {
                clearTimeout(pressTimer);
              });
              
              // Handle messages from React Native
              window.addEventListener('message', function(event) {
                const message = JSON.parse(event.data);
                
                if (message.type === 'set_location') {
                  map.setView([message.latLng.latitude, message.latLng.longitude], 15);
                  
                  // Add user location marker
                  if (window.userLocationMarker) {
                    map.removeLayer(window.userLocationMarker);
                  }
                  
                  window.userLocationMarker = L.circleMarker(
                    [message.latLng.latitude, message.latLng.longitude],
                    {
                      radius: 8,
                      fillColor: '#4285F4',
                      color: '#ffffff',
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.8
                    }
                  ).addTo(map);
                }
              });
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
              const station = policeStations.find((s) => s.id === data.id);
              if (station) {
                showStationDetails(station);
              }
            } else if (data.type === "emergency_selected") {
              const emergency = emergencyRespondents.find(
                (e) => e.id === data.id,
              );
              if (emergency) {
                showEmergencyDetails(emergency);
              }
            } else if (data.type === "incident_selected") {
              const incident = recentIncidents.find((i) => i.id === data.id);
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
          onPress={() => {
            if (userLocation) {
              setReportLocation(userLocation);
              setReportForm({
                ...reportForm,
                location: userLocation,
              });
              setReportModalVisible(true);
            }
          }}
        >
          <MaterialIcons name="report" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View
        style={[
          styles.legend,
          {
            backgroundColor: theme.legendBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "blue" }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>
            Police Station
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "red" }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>Theft</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "orange" }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>
            Suspicious Activity
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View
        style={[
          styles.infoBanner,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(0, 0, 0, 0.7)",
          },
        ]}
      >
        <Text style={styles.infoText}>
          Press and hold on the map to report an incident at that location
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View
          style={[styles.loadingContainer, { backgroundColor: theme.overlay }]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Getting your location...
          </Text>
        </View>
      )}

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalBlur}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.card,
                shadowColor: colorScheme === "dark" ? "#000" : "#333",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Report an Incident
              </Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.tabContainer, { borderBottomColor: theme.border }]}
            >
              <TouchableOpacity
                style={[styles.tab, selectedTab === "form" && styles.activeTab]}
                onPress={() => setSelectedTab("form")}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: theme.textSecondary },
                    selectedTab === "form" && {
                      color: theme.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Info
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "media" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("media")}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: theme.textSecondary },
                    selectedTab === "media" && {
                      color: theme.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Media
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedTab === "form" ? (
                // Form Tab
                <View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Incident Type</Text>
                    <View style={styles.typeButtonContainer}>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          reportForm.type === "theft" &&
                            styles.activeTypeButton,
                        ]}
                        onPress={() =>
                          setReportForm({ ...reportForm, type: "theft" })
                        }
                      >
                        <Text style={styles.typeButtonText}>Theft</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          reportForm.type === "suspicious" &&
                            styles.activeTypeButton,
                        ]}
                        onPress={() =>
                          setReportForm({ ...reportForm, type: "suspicious" })
                        }
                      >
                        <Text style={styles.typeButtonText}>Suspicious</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          reportForm.type === "other" &&
                            styles.activeTypeButton,
                        ]}
                        onPress={() =>
                          setReportForm({ ...reportForm, type: "other" })
                        }
                      >
                        <Text style={styles.typeButtonText}>Other</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Title</Text>
                    <TextInput
                      style={styles.input}
                      value={reportForm.title}
                      onChangeText={(text) =>
                        setReportForm({ ...reportForm, title: text })
                      }
                      placeholder="Brief title of the incident"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={reportForm.description}
                      onChangeText={(text) =>
                        setReportForm({ ...reportForm, description: text })
                      }
                      placeholder="Describe what happened"
                      multiline={true}
                      numberOfLines={4}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Location</Text>
                    <View style={styles.locationInfo}>
                      <Ionicons name="location" size={20} color="#333" />
                      <Text style={styles.locationText}>
                        {reportForm.location
                          ? `Lat: ${reportForm.location.latitude.toFixed(4)}, Lng: ${reportForm.location.longitude.toFixed(4)}`
                          : "No location selected"}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                // Media Tab
                <View style={styles.mediaContainer}>
                  <Text style={styles.sectionTitle}>Add Media</Text>
                  <Text style={styles.mediaSubtitle}>
                    Upload photos or videos related to the incident
                  </Text>

                  <View style={styles.mediaButtons}>
                    <TouchableOpacity style={styles.mediaButton}>
                      <Ionicons name="camera" size={32} color="#333" />
                      <Text style={styles.mediaButtonText}>Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.mediaButton}>
                      <Ionicons name="image" size={32} color="#333" />
                      <Text style={styles.mediaButtonText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.mediaButton}>
                      <Ionicons name="mic" size={32} color="#333" />
                      <Text style={styles.mediaButtonText}>Audio</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.mediaPreviewContainer}>
                    <Text style={styles.mediaPreviewText}>
                      {reportForm.media.length > 0
                        ? `${reportForm.media.length} items added`
                        : "No media added yet"}
                    </Text>

                    {reportForm.media.length === 0 && (
                      <View style={styles.emptyMedia}>
                        <Ionicons
                          name="images-outline"
                          size={48}
                          color="#ccc"
                        />
                        <Text style={styles.emptyMediaText}>
                          Photos and videos will appear here
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReport}
                disabled={
                  !reportForm.title ||
                  !reportForm.description ||
                  !reportForm.location
                }
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Details Modal for Police Stations and Incidents */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalBlur}>
          <View style={styles.detailsContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedStation
                  ? selectedStation.name
                  : selectedIncident
                    ? selectedIncident.title
                    : "Details"}
              </Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedStation && (
                <View style={styles.detailsContent}>
                  <View style={styles.detailsItem}>
                    <Ionicons name="location" size={24} color="#333" />
                    <Text style={styles.detailsText}>
                      {selectedStation.address}
                    </Text>
                  </View>

                  <View style={styles.detailsItem}>
                    <Ionicons name="call" size={24} color="#333" />
                    <Text style={styles.detailsText}>
                      {selectedStation.phone}
                    </Text>
                  </View>

                  <View style={styles.detailsActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="navigate" size={24} color="#007bff" />
                      <Text style={styles.actionText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="call" size={24} color="#28a745" />
                      <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {selectedIncident && (
                <View style={styles.detailsContent}>
                  <View style={styles.detailsItem}>
                    <MaterialIcons
                      name="report-problem"
                      size={24}
                      color="#333"
                    />
                    <Text style={styles.detailsText}>
                      {selectedIncident.description}
                    </Text>
                  </View>

                  <View style={styles.detailsItem}>
                    <Ionicons name="time" size={24} color="#333" />
                    <Text style={styles.detailsText}>
                      {new Date(selectedIncident.date).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailsItem}>
                    <Ionicons name="person" size={24} color="#333" />
                    <Text style={styles.detailsText}>
                      Reported by: {selectedIncident.reportedBy}
                    </Text>
                  </View>

                  <View style={styles.detailsActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="navigate" size={24} color="#007bff" />
                      <Text style={styles.actionText}>View Location</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setDetailsModalVisible(false);
                        // Add logic to report a similar incident
                        if (selectedIncident) {
                          setReportLocation(selectedIncident.location);
                          setReportForm({
                            ...reportForm,
                            location: selectedIncident.location,
                            type: selectedIncident.type,
                          });
                          setReportModalVisible(true);
                        }
                      }}
                    >
                      <MaterialIcons name="report" size={24} color="#dc3545" />
                      <Text style={styles.actionText}>Report Similar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
