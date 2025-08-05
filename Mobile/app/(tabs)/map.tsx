import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  useColorScheme,
  ActivityIndicator, // For a better loading indicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { io, Socket } from "socket.io-client";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { getBackendUrl } from "../constants/backend";

// Define dictLocationPing
type dictLocationPing = {
  lat: number;
  lng: number;
  emergency_type: string;
  description: string;
  timestamp: string;
  // Add any other relevant properties for a ping
  id?: string;
  status?: string;
  [key: string]: any; // Allow for other potential fields
};

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
    overlay: "rgba(255, 255, 255, 0.7)",
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
    overlay: "rgba(0, 0, 0, 0.5)",
  },
};

const MapScreen = () => {
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mapCenter, setMapCenter] = useState({
    latitude: 10.67587960052236, // Default center
    longitude: 122.95247794951611,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false); // New state for follow mode
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  ); // For watchPositionAsync

  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyPings, setEmergencyPings] = useState<dictLocationPing[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSocketConnecting, setIsSocketConnecting] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const messageQueueRef = useRef<string[]>([]);

  const postMessageToWebView = useCallback(
    (messageObject: object) => {
      const messageString = JSON.stringify(messageObject);
      const messageType = (messageObject as any).type;

      if (webViewRef.current && isWebViewReady) {
        // console.log(`[RN POST] WebView READY. Posting: ${messageType}`);
        webViewRef.current.postMessage(messageString);
      } else {
        console.warn(
          `[RN POST] WebView NOT READY (isReady: ${isWebViewReady}, ref: ${!!webViewRef.current}). Queuing: ${messageType}`,
        );
        messageQueueRef.current.push(messageString);
      }
    },
    [isWebViewReady],
  );

  const connectEmergencyServices = useCallback(() => {
    if (isSocketConnecting || isSocketConnected) return;
    console.log("Attempting to connect to emergency services socket...");
    setIsSocketConnecting(true);

    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      console.error("Backend URL is undefined.");
      setIsSocketConnecting(false);
      return;
    }

    const newSocketInstance = io(backendUrl, {
      timeout: 10000,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
    });

    newSocketInstance.on("connect", () => {
      console.log("Socket connected.");
      setSocket(newSocketInstance);
      setIsSocketConnected(true);
      setIsSocketConnecting(false);
      newSocketInstance.emit("join-emergency-services");
    });

    newSocketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocket(null);
      setIsSocketConnected(false);
      setIsSocketConnecting(false);
    });

    newSocketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      Alert.alert("Connection Error", `Failed to connect: ${error.message}`);
      setSocket(null);
      setIsSocketConnected(false);
      setIsSocketConnecting(false);
    });

    newSocketInstance.on(
      "emergency-alert",
      (dictLocationData: dictLocationPing | dictLocationPing[]) => {
        console.log("Received raw emergency alert:", dictLocationData);
        const rawPings = Array.isArray(dictLocationData)
          ? dictLocationData
          : [dictLocationData];
        const processedPings = rawPings
          .map((p) => {
            const newLat = typeof p.lat === "number" ? p.lat : p.dblLatitude;
            const newLng = typeof p.lng === "number" ? p.lng : p.dblLongitude;
            if (typeof newLat !== "number" || typeof newLng !== "number") {
              console.error("Malformed ping (lat/lng invalid):", p);
              return null;
            }
            const newId =
              p.id ||
              p.strReporterId ||
              `Emergency-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            return {
              ...p,
              id: newId,
              lat: newLat,
              lng: newLng,
              emergency_type: p.emergency_type || "Unknown Emergency",
              description: p.description || "Emergency reported.",
              timestamp: p.timestamp || new Date().toISOString(),
            };
          })
          .filter((p) => p !== null) as dictLocationPing[]; // Ensure type is correct after filter

        if (processedPings.length > 0) {
          console.log("Processed pings to add/update:", processedPings.length);
          setEmergencyPings((prevPings) => {
            const updatedPings = [...prevPings];
            processedPings.forEach((newPing) => {
              const idx = updatedPings.findIndex((ep) => ep.id === newPing.id);
              if (idx > -1) updatedPings[idx] = newPing;
              else updatedPings.push(newPing);
            });
            return updatedPings;
          });
          processedPings.forEach((procPing) =>
            postMessageToWebView({ type: "addEmergencyPing", ping: procPing }),
          );
        }
      },
    );
  }, [isSocketConnecting, isSocketConnected, postMessageToWebView]);

  const disconnectEmergencyServices = useCallback(() => {
    if (socket) {
      console.log("Disconnecting socket...");
      socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    // Socket cleanup
    return () => {
      if (socket) {
        console.log("MapScreen unmounting, disconnecting socket.");
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleSocketToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSocketConnected) disconnectEmergencyServices();
    else if (!isSocketConnecting) connectEmergencyServices();
  };

  const handleLocationButtonPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFollowingUser) {
      stopFollowingUser();
    } else {
      await startFollowingUser();
    }
  };

  const startFollowingUser = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        setIsLoadingLocation(false);
        return;
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("Location Disabled", "Please enable location services.");
        setIsLoadingLocation(false);
        return;
      }

      setIsFollowingUser(true); // Set follow mode true
      console.log("Starting to follow user location...");

      // Get one immediate location update
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const currentLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(currentLoc);
        setMapCenter(currentLoc);
        postMessageToWebView({
          type: "centerOnUser",
          lat: currentLoc.latitude,
          lng: currentLoc.longitude,
        });
      } catch (err) {
        console.warn("Error getting initial position for follow mode:", err);
        // Don't stop following if initial fails, watch will try again
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLoc = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          console.log("Follow mode update:", newLoc.latitude, newLoc.longitude);
          setUserLocation(newLoc);
          if (isFollowingUserRef.current) {
            // Check ref to ensure still following
            setMapCenter(newLoc); // Keep centering map
            postMessageToWebView({
              type: "centerOnUser",
              lat: newLoc.latitude,
              lng: newLoc.longitude,
            });
          }
        },
      );
    } catch (error: any) {
      console.error("Error starting location watch:", error);
      Alert.alert(
        "Location Error",
        error.message || "Could not start location tracking.",
      );
      setIsFollowingUser(false); // Turn off follow mode on error
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Ref to access isFollowingUser in watchPositionAsync callback without stale closure
  const isFollowingUserRef = useRef(isFollowingUser);
  useEffect(() => {
    isFollowingUserRef.current = isFollowingUser;
  }, [isFollowingUser]);

  const stopFollowingUser = () => {
    console.log("Stopping user location follow.");
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    setMapCenter(mapCenter);
    setIsFollowingUser(false);
  };

  useEffect(() => {
    // Location watch cleanup
    return () => {
      if (locationSubscriptionRef.current) {
        console.log("MapScreen unmounting, removing location subscription.");
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  const navigateToMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/menu" as any);
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    let data;
    const rawData = event.nativeEvent.data;
    // console.log("[RN] Raw WebView message:", rawData);
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("[RN] Error parsing WebView message:", e, rawData);
      return;
    }

    if (data.type === "webViewLoaded") {
      console.log(`
      [RN] WebView loaded (isReady was: ${isWebViewReady}, step: ${data.step})
      `);
      setIsWebViewReady(true);
      if (webViewRef.current) {
        const currentWebView = webViewRef.current;
        if (messageQueueRef.current.length > 0) {
          console.log(
            `[RN] Processing ${messageQueueRef.current.length} queued messages.`,
          );
          messageQueueRef.current.forEach((msg) =>
            currentWebView.postMessage(msg),
          );
          messageQueueRef.current = [];
        }
      }
      if (userLocation) {
        // Re-add user marker if WebView reloaded
        console.log("[RN] WebView reloaded, re-adding user location marker.");
        postMessageToWebView({
          type: "centerOnUser",
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
      }
      if (emergencyPings.length > 0) {
        // Re-add emergency pings
        console.log(
          `[RN] WebView reloaded, re-adding ${emergencyPings.length} pings.`,
        );
        emergencyPings.forEach((ping) => {
          if (
            ping &&
            typeof ping.lat === "number" &&
            typeof ping.lng === "number" &&
            ping.id
          ) {
            postMessageToWebView({
              type: "addEmergencyPing",
              ping: {
                lat: ping.lat,
                lng: ping.lng,
                id: ping.id,
                emergency_type: ping.emergency_type,
                description: ping.description,
                timestamp: ping.timestamp,
              },
            });
          }
        });
      }
    } else if (data.type === "webViewLog" || data.type === "webViewError") {
      console.log(`[WebView INTERNAL] ${data.message}`);
    } else {
      console.log("[RN] Unhandled WebView message:", data);
    }
  };

  const mapHTML = useMemo(() => {
    console.log(
      `Generating mapHTML with center: ${mapCenter.latitude}, ${mapCenter.longitude}`,
    );
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
              body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
              #map { height: 100vh; width: 100vw; background-color: #DDD; } /* Light grey bg */
              .custom-popup { min-width: 200px; max-width: 250px; }
              .marker-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #333; }
              .marker-description { font-size: 14px; margin-bottom: 5px; color: #666; word-wrap: break-word; }
              .marker-type { font-size: 12px; font-weight: 600; color: #0095F6; margin-bottom: 3px; }
              .marker-timestamp { font-size: 11px; color: #777; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
              function postToReactNative(type, payload) {
                const message = JSON.stringify({ type: type, ...payload });
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(message);
                }
              }

              var originalConsoleLog = console.log;
              var originalConsoleError = console.error;
              console.log = function() {
                var args = Array.from(arguments);
                var msg = args.map(function(arg) {
                    if (typeof arg === 'object' && arg !== null) { try { return JSON.stringify(arg); } catch (e) { return arg.toString(); } }
                    return arg;
                }).join(' ');
                postToReactNative('webViewLog', { message: '[LOG] ' + msg });
                originalConsoleLog.apply(console, args);
              };
              console.error = function() {
                var args = Array.from(arguments);
                var msg = args.map(function(arg) {
                    if (typeof arg === 'object' && arg !== null) { try { return JSON.stringify(arg); } catch (e) { return arg.toString(); } }
                    return arg;
                }).join(' ');
                postToReactNative('webViewError', { message: '[ERROR] ' + msg });
                originalConsoleError.apply(console, args);
              };
              console.log("Console overrides active.");

              var map = null;
              var userMarker = null;
              var emergencyPingMarkers = {};

              try {
                map = L.map('map', { preferCanvas: true }).setView([${mapCenter.latitude}, ${mapCenter.longitude}], 13);
                console.log('Map initialized.');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap', maxZoom: 19, minZoom: 5
                }).addTo(map);
                console.log('Tile layer added.');
              } catch(e) {
                console.error('Map/tile init error:', e.toString());
              }

              document.addEventListener('message', function(event) {
                // console.log('WebView listener fired. Raw data:', event.data);
                var data;
                try {
                  if (typeof event.data === 'string') data = JSON.parse(event.data);
                  else if (typeof event.data === 'object' && event.data !== null) data = event.data;
                  else { console.error('Invalid event.data type:', event.data); return; }
                } catch (e) { console.error('Error parsing message from RN:', e.toString()); return; }
                
                if (!map && (data.type === 'addEmergencyPing' || data.type === 'centerOnUser')) {
                    console.error('Map is null. Cannot process:', data.type); return;
                }

                if (data.type === 'addEmergencyPing') {
                  var ping = data.ping;
                  // console.log('Processing addEmergencyPing:', ping.id);
                  if (ping && typeof ping.lat === 'number' && typeof ping.lng === 'number' && ping.id) {
                    if (emergencyPingMarkers[ping.id]) map.removeLayer(emergencyPingMarkers[ping.id]);
                    var popupContent = \`<div class="custom-popup">
                                          <div class="marker-title">\${ping.emergency_type || 'Emergency'}</div>
                                          <div class="marker-description">\${ping.description || 'Details unavailable.'}</div>
                                          <div class="marker-type">ID: \${ping.id}</div>
                                          <div class="marker-timestamp">Time: \${new Date(ping.timestamp).toLocaleString()}</div>
                                        </div>\`;
                    var eMarker = L.marker([ping.lat, ping.lng], {
                      icon: L.divIcon({
                        className: 'emergency-ping-icon',
                        html: '<div style="background-color: #FF3B30; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                        iconSize: [22, 22], iconAnchor: [11, 11]
                      }), zIndexOffset: 950
                    }).addTo(map).bindPopup(popupContent);
                    emergencyPingMarkers[ping.id] = eMarker;
                  } else { console.error('Invalid emergency ping data:', ping); }
                } else if (data.type === 'centerOnUser') {
                  // console.log('Processing centerOnUser:', data.lat, data.lng);
                  if (typeof data.lat === 'number' && typeof data.lng === 'number') {
                    if (userMarker) map.removeLayer(userMarker);
                    userMarker = L.marker([data.lat, data.lng], {
                      icon: L.divIcon({
                        className: 'user-location-icon',
                        html: '<div style="background-color: #0095F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                        iconSize: [22, 22], iconAnchor: [11, 11]
                      }), zIndexOffset: 1000
                    }).addTo(map);
                    map.setView([data.lat, data.lng], 15);
                  } else { console.error('Invalid user location data for centerOnUser:', data); }
                } else {
                  // console.log('Unhandled WebView message type:', data.type);
                }
              });
              console.log('Document message listener added.');

              postToReactNative('webViewLoaded', { status: 'success', timestamp: new Date().toISOString(), step: 'final-html' });
              console.log('webViewLoaded message sent to RN.');
          </script>
      </body>
      </html>
    `;
  }, [mapCenter.latitude, mapCenter.longitude]); // mapHTML should only depend on mapCenter for initial view.

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
          <TouchableOpacity onPress={navigateToMenu} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Map</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
      {/* Map */}
      <View style={styles.mapOuterContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.mapWebView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback={true}
          onError={(syntheticEvent) =>
            console.warn("WebView error:", syntheticEvent.nativeEvent)
          }
          onLoadStart={() => console.log("WebView onLoadStart")}
          onLoadEnd={() => console.log("WebView onLoadEnd")}
        />
        <View style={styles.mapControlsContainer}>
          <TouchableOpacity
            style={[styles.mapControlButton, { backgroundColor: theme.card }]}
            onPress={handleSocketToggle}
            accessibilityLabel={
              isSocketConnected ? "Disconnect services" : "Connect services"
            }
          >
            <Ionicons
              name={
                isSocketConnected
                  ? "close-circle-outline"
                  : isSocketConnecting
                    ? "sync-circle-outline"
                    : "wifi-outline"
              }
              size={28}
              color={
                isSocketConnecting
                  ? theme.primary
                  : isSocketConnected
                    ? theme.secondary
                    : theme.text
              }
            />
          </TouchableOpacity>
          <TouchableOpacity // Location Button
            style={[
              styles.mapControlButton,
              { backgroundColor: theme.card, marginTop: 10 },
            ]}
            onPress={handleLocationButtonPress}
            accessibilityLabel={
              isFollowingUser
                ? "Stop following location"
                : "Follow current location"
            }
          >
            <Ionicons
              name={isFollowingUser ? "navigate-circle" : "navigate-outline"} // Icon changes based on follow state
              size={28}
              color={
                isLoadingLocation
                  ? theme.tertiary
                  : isFollowingUser
                    ? theme.primary
                    : theme.text
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      {isLoadingLocation && (
        <LoadingIndicator theme={theme} text="Fetching location..." />
      )}
    </View>
  );
};

// Adapted styles from your original file, ensuring new ones are present.
// Make sure to remove any redundant/conflicting old styles.
const styles = StyleSheet.create({
  container: { flex: 1 },
  menuButton: { padding: 8 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 46 }, // Approx Ionicons size + padding
  header: { paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  mapOuterContainer: { flex: 1, position: "relative" },
  mapWebView: { flex: 1, width: "100%", height: "100%" },
  mapControlsContainer: {
    position: "absolute",
    right: 16,
    bottom: 16 + (Platform.OS === "ios" ? 0 : 10),
    alignItems: "flex-end",
  },
  mapControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  // Keep your other styles (socketButton, mapButton, LoadingIndicator styles etc.)
  // For LoadingIndicator:
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
});

interface LoadingIndicatorProps {
  theme: typeof themeColors.light; // Or your specific theme type
  text?: string;
}
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  theme,
  text = "Loading...",
}) => (
  <View style={[styles.loadingContainer, { backgroundColor: theme.overlay }]}>
    <ActivityIndicator size="large" color={theme.primary} />
    <Text style={[styles.loadingText, { color: theme.text }]}>{text}</Text>
  </View>
);

export default MapScreen;
