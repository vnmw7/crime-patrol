import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  ScrollView,
} from "react-native";
import WebView from "react-native-webview";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const themeColors = {
  light: {
    primary: "#0095F6",
    secondary: "#FF3B30",
    tertiary: "#007AFF",
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#262626",
    textSecondary: "#8E8E8E",
    border: "#DBDBDB",
    inactiveTab: "#8E8E8E",
    inputBackground: "#F2F2F2",
    buttonBackground: "#F5F5F5",
    calloutBackground: "#FFFFFF",
    calloutBorder: "#E1E1E1",
    legendBackground: "#FFFFFF",
    overlay: "rgba(255, 255, 255, 0.7)",
    mapControlBackground: "#FFFFFF",
  },
  dark: {
    primary: "#0095F6",
    secondary: "#FF453A",
    tertiary: "#0A84FF",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    border: "#2C2C2C",
    inactiveTab: "#6E6E6E",
    inputBackground: "#2C2C2C",
    buttonBackground: "#2C2C2C",
    calloutBackground: "#1E1E1E",
    calloutBorder: "#2C2C2C",
    legendBackground: "#1E1E1E",
    overlay: "rgba(0, 0, 0, 0.7)",
    mapControlBackground: "#1E1E1E",
  },
};

// Sample markers data
const sampleMarkers = [
  {
    id: "1",
    title: "Police Station 1",
    description: "Main Police Station",
    lat: 10.6749,
    lng: 122.9529,
    type: "police",
  },
  {
    id: "2",
    title: "Hospital",
    description: "General Hospital",
    lat: 10.682,
    lng: 122.956,
    type: "hospital",
  },
  {
    id: "3",
    title: "Fire Station",
    description: "Emergency Fire Response",
    lat: 10.67,
    lng: 122.948,
    type: "fire",
  },
  {
    id: "4",
    title: "Emergency Center",
    description: "24/7 Emergency Services",
    lat: 10.678,
    lng: 122.962,
    type: "emergency",
  },
];

const legendData = [
  { label: "Police", color: "#0066cc" },
  { label: "Hospital", color: "#00cc00" },
  { label: "Fire Station", color: "#cc0000" },
  { label: "Emergency", color: "#ff9900" },
];

const TestMapScreen = () => {
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [mapCenter] = useState({ lat: 10.6749, lng: 122.9529 }); // Default to Bacolod City

  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  // Function to get user's location
  const getUserLocation = useCallback(async () => {
    console.log("[getUserLocation] Called");
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("[getUserLocation] Permission status:", status);

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to show your position on the map.",
          [{ text: "OK" }],
        );
        setIsLoadingLocation(false);
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const userLoc = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      console.log("[getUserLocation] User location fetched:", userLoc);

      if (webViewRef.current) {
        const message = JSON.stringify({
          type: "centerOnUser",
          lat: userLoc.latitude,
          lng: userLoc.longitude,
        });
        webViewRef.current.postMessage(message);
        console.log("[getUserLocation] Message sent to WebView:", message);
      } else {
        console.error(
          "[getUserLocation] webViewRef.current is null when trying to post message",
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your location. Please try again.");
    } finally {
      setIsLoadingLocation(false);
    }
  }, []); // webViewRef itself is stable, so not strictly needed in deps

  // Function to fit map to show all markers
  const fitMapToMarkers = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "fitToMarkers",
        }),
      );
      console.log("[fitMapToMarkers] Message sent to WebView");
    } else {
      console.error("[fitMapToMarkers] webViewRef.current is null");
    }
  }, []);

  // Function to handle marker press
  const onMarkerPress = useCallback((marker: any) => {
    setSelectedMarker(marker);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Create HTML for the map - MEMOIZED
  const mapHTML = useMemo(() => {
    console.log("[TestMapScreen] Generating map HTML (should happen rarely)"); // For debugging

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        #map { height: 100vh; width: 100vw; }
        .custom-popup { min-width: 200px; }
        .marker-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #333; }
        .marker-description { font-size: 14px; margin-bottom: 5px; color: #666; }
        .marker-type { font-size: 12px; font-weight: 600; color: #0095F6; }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script>
        // Store original console methods
        var originalLog = console.log;
        var originalError = console.error;

        function postToReactNative(type, data) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
            } else {
                originalError.call(console, 'ReactNativeWebView.postMessage is not available.');
            }
        }

        // Override console.log
        console.log = function() {
            var args = Array.from(arguments);
            var message = args.map(function(arg) {
                if (typeof arg === 'object' && arg !== null) {
                    try { return JSON.stringify(arg); } catch (e) { return arg.toString(); }
                }
                return arg;
            }).join(' ');
            postToReactNative('webViewLog', { message: '[WebView LOG] ' + message });
            originalLog.apply(console, args);
        };

        // Override console.error
        console.error = function() {
            var args = Array.from(arguments);
            var message = args.map(function(arg) {
                if (typeof arg === 'object' && arg !== null) {
                    try { return JSON.stringify(arg); } catch (e) { return arg.toString(); }
                }
                return arg;
            }).join(' ');
            postToReactNative('webViewError', { message: '[WebView ERROR] ' + message });
            originalError.apply(console, args);
        };

        console.log('WebView console override initialized.');

        var map = null;
        var userMarker = null;
        var markers = []; // To store Leaflet marker instances

        try {
            map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lng}], 13);
            console.log('Map initialized successfully at [${mapCenter.lat}, ${mapCenter.lng}].');
        } catch(e) {
            console.error('Error initializing map:', e.toString(), e.stack);
        }
        
        if (map) {
            try {
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    keepBuffer: 8
                }).addTo(map);
                console.log('Tile layer added to map.');
            } catch(e) {
                console.error('Error adding tile layer:', e.toString(), e.stack);
            }
        } else {
            console.error('Map object not available for adding tile layer or markers.');
        }

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            console.log('Message received from RN (raw):', event.data); 
            try {
                var data = JSON.parse(event.data);
                console.log('Parsed data from RN:', data);
                
                if (!map) {
                    console.error('Map not initialized, cannot process message:', data.type);
                    return;
                }

                if (data.type === 'centerOnUser') {
                    console.log('Processing centerOnUser. Lat:', data.lat, 'Lng:', data.lng);
                    if (typeof map.setView === 'function') {
                        map.setView([data.lat, data.lng], 15);
                        console.log('map.setView called for user location.');
                        
                        if (userMarker) {
                            map.removeLayer(userMarker);
                            console.log('Previous userMarker removed.');
                        }
                        
                        userMarker = L.marker([data.lat, data.lng], {
                            icon: L.divIcon({
                                className: 'user-location-icon',
                                html: '<div style="background-color: #0095F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                                iconSize: [22, 22], iconAnchor: [11, 11]
                            })
                        }).addTo(map);
                        userMarker.setZIndexOffset(1000); // Ensure user marker is on top
                        console.log('New userMarker added at [', data.lat, ',', data.lng, '].');
                    } else {
                        console.error('map.setView is not a function.');
                    }
                } else if (data.type === 'fitToMarkers') {
                    console.log('Processing fitToMarkers. Current markers count:', markers.length);
                    if (markers.length > 0 && typeof map.fitBounds === 'function') {
                        var group = new L.featureGroup(markers);
                        if (userMarker) {
                            group.addLayer(userMarker);
                        }
                        if (group.getLayers().length > 0) {
                           map.fitBounds(group.getBounds().pad(0.1));
                           console.log('map.fitBounds called for markers.');
                        } else {
                           console.log('fitToMarkers: No layers in feature group to fit.');
                        }
                    } else if (markers.length === 0) {
                        console.error('fitToMarkers: No markers to fit.');
                    } else {
                        console.error('map.fitBounds is not a function or no markers.');
                    }
                } else {
                    console.log('Received unhandled message type from RN:', data.type);
                }
            } catch (e) {
                console.error('Error processing message from RN:', e.toString(), 'Stack:', e.stack, 'Raw data:', event.data);
            }
        });
        console.log('Message event listener for RN messages added.');
        postToReactNative('webViewLoaded', { status: 'success' }); // Inform RN that WebView JS is ready
    </script>
</body>
</html>
    `;
  }, [mapCenter]);

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "markerPress") {
        console.log("[RN] Received markerPress from WebView:", data.marker);
        onMarkerPress(data.marker);
      } else if (data.type === "webViewLog") {
        console.log(data.message); // Relayed from WebView console.log
      } else if (data.type === "webViewError") {
        console.error(data.message); // Relayed from WebView console.error
      } else if (data.type === "webViewLoaded") {
        console.log("[RN] WebView content and JS loaded.");
      } else {
        console.log(
          "[RN] Received unhandled/raw data from WebView:",
          event.nativeEvent.data,
        );
      }
    } catch (error) {
      console.warn(
        "[RN] Error parsing WebView message JSON. Raw data:",
        event.nativeEvent.data,
        error,
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Test Map Screen
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          OpenStreetMap with Leaflet
        </Text>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback={true}
        />

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[
              styles.mapButton,
              { backgroundColor: theme.mapControlBackground },
            ]}
            onPress={getUserLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="locate" size={24} color={theme.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapButton,
              { backgroundColor: theme.mapControlBackground },
            ]}
            onPress={fitMapToMarkers}
          >
            <Ionicons name="scan" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Loading indicator for map operations */}
        {isLoadingMap && (
          <View
            style={[styles.loadingOverlay, { backgroundColor: theme.overlay }]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading map data...
            </Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View
        style={[
          styles.legend,
          {
            backgroundColor: theme.legendBackground,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.legendTitle, { color: theme.text }]}>
          Map Legend
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendItems}>
            {legendData.map((item, index) => (
              <View style={styles.legendItem} key={index}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text
                  style={[styles.legendText, { color: theme.textSecondary }]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <View
          style={[
            styles.selectedMarkerInfo,
            { backgroundColor: theme.card, bottom: insets.bottom + 10 },
          ]}
        >
          <View style={styles.selectedMarkerHeader}>
            <Text style={[styles.selectedMarkerTitle, { color: theme.text }]}>
              {selectedMarker.title}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedMarker(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.selectedMarkerDescription,
              { color: theme.textSecondary },
            ]}
          >
            {selectedMarker.description}
          </Text>
          <Text
            style={[
              styles.selectedMarkerType,
              { color: theme.textSecondary, opacity: 0.8 },
            ]}
          >
            Type: {selectedMarker.type}
          </Text>
        </View>
      )}

      {/* Attribution */}
      <View
        style={[
          styles.attribution,
          { bottom: insets.bottom + 5, backgroundColor: theme.overlay },
        ]}
      >
        <Text style={[styles.attributionText, { color: theme.textSecondary }]}>
          © OpenStreetMap contributors
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: "relative", // Needed for absolute positioning of children
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    top: 15,
    right: 15,
    gap: 10, // For spacing between buttons
    zIndex: 10, // Ensure controls are above the map
  },
  mapButton: {
    width: 50,
    height: 50,
    borderRadius: 25, // Makes it circular
    justifyContent: "center",
    alignItems: "center",
    // Adding some shadow for better visibility
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20, // Above map and controls
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  legend: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    gap: 20, // Spacing between legend items
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Spacing between dot and text
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6, // Circular dot
  },
  legendText: {
    fontSize: 14,
  },
  selectedMarkerInfo: {
    position: "absolute",
    left: 0,
    right: 0,
    // bottom is set dynamically using insets
    marginHorizontal: 10,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // No bottom radius for a sheet-like appearance from the bottom
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Shadow upwards
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 30, // Above everything else except modals
  },
  selectedMarkerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedMarkerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1, // Allow title to take available space
  },
  closeButton: {
    padding: 5, // Easier to tap
    marginLeft: 10, // Space from title
  },
  selectedMarkerDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  selectedMarkerType: {
    fontSize: 12,
    fontWeight: "600",
    // opacity and color are set dynamically in the component
  },
  attribution: {
    position: "absolute",
    right: 10,
    // bottom and backgroundColor are set dynamically using insets and theme
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 5, // Above map, below controls if they overlap
  },
  attributionText: {
    fontSize: 10,
  },
});

export default TestMapScreen;
