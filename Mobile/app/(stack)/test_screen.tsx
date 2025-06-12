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
  Dimensions,
  ActivityIndicator, // Added for LoadingIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { io, Socket } from "socket.io-client";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

type dictLocationPing = {
  lat: number;
  lng: number;
  emergency_type: string;
  description: string;
  timestamp: string;
  id?: string;
  status?: string;
  // Allow for other potential fields from backend like dblLatitude, strReporterId
  [key: string]: any;
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
    overlay: "rgba(255, 255, 255, 0.7)", // Added overlay
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
    overlay: "rgba(0, 0, 0, 0.5)", // Added overlay
  },
};

const MapScreen = () => {
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mapCenter, setMapCenter] = useState({
    latitude: 10.67587960052236,
    longitude: 122.95247794951611,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyPings, setEmergencyPings] = useState<dictLocationPing[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSocketConnecting, setIsSocketConnecting] = useState(false);

  // New state for WebView readiness and message queue
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const messageQueueRef = useRef<string[]>([]);

  const getBackendUrl = useCallback(() => {
    if (__DEV__) {
      // Ensure this IP is accessible from your device/emulator
      return Platform.OS === "android"
        ? "http://192.168.254.120:3000" // Or "http://10.0.2.2:3000" for Android Emulator default
        : "http://192.168.254.120:3000"; // Or "http://localhost:3000" for iOS Simulator
    } else {
      return "https://your-production-backend.com";
    }
  }, []);
  // Centralized function to post messages to WebView
  const postMessageToWebView = useCallback(
    (messageObject: object) => {
      const messageString = JSON.stringify(messageObject);
      const messageType = (messageObject as any).type; // Get type for logging

      if (webViewRef.current && isWebViewReady) {
        console.log(
          `[RN POST MESSAGE] WebView IS READY. Posting message directly. Type: ${messageType}`,
          messageString,
        );
        webViewRef.current.postMessage(messageString);
      } else {
        console.warn(
          `[RN POST MESSAGE] WebView NOT READY (isWebViewReady: ${isWebViewReady}, webViewRef.current: ${!!webViewRef.current}). Queuing message. Type: ${messageType}`,
          // messageString // Optionally log the full string if needed for debugging
        );
        messageQueueRef.current.push(messageString);
      }
    },
    [isWebViewReady], // Depends on isWebViewReady state
  );

  const connectEmergencyServices = useCallback(() => {
    if (isSocketConnecting || isSocketConnected) {
      console.log(
        "Socket connection attempt skipped: already connecting or connected.",
      );
      return;
    }
    console.log("Attempting to connect to emergency services via socket...");
    setIsSocketConnecting(true);

    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      console.error("Backend URL is undefined. Cannot connect socket.");
      setIsSocketConnecting(false);
      return;
    }

    const newSocketInstance = io(backendUrl, {
      timeout: 10000,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
    });

    newSocketInstance.on("connect", () => {
      console.log("Socket connected successfully.");
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
      setSocket(null);
      setIsSocketConnected(false);
      setIsSocketConnecting(false);
      Alert.alert(
        "Connection Error",
        `Failed to connect to services: ${error.message}`,
      );
    });

    newSocketInstance.on(
      "emergency-alert",
      (dictLocationData: dictLocationPing | dictLocationPing[]) => {
        console.log("Received raw emergency alert data:", dictLocationData);
        const rawPings = Array.isArray(dictLocationData)
          ? dictLocationData
          : [dictLocationData];

        const processedPings: dictLocationPing[] = rawPings
          .map((p) => {
            const newLat = typeof p.lat === "number" ? p.lat : p.dblLatitude;
            const newLng = typeof p.lng === "number" ? p.lng : p.dblLongitude;

            if (typeof newLat !== "number" || typeof newLng !== "number") {
              console.error(
                "Malformed ping data (lat/lng invalid or missing):",
                p,
              );
              return null;
            }
            // Ensure a unique and consistent ID. Prioritize backend-provided IDs.
            const newId =
              p.id ||
              p.strReporterId ||
              `Emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            return {
              ...p, // Spread original data first
              id: newId, // Then override/set standardized fields
              lat: newLat,
              lng: newLng,
              emergency_type: p.emergency_type || "Unknown Emergency",
              description:
                p.description || "Emergency reported at this location.",
              timestamp: p.timestamp || new Date().toISOString(),
            };
          })
          .filter((p) => p !== null) as dictLocationPing[]; // Filter out nulls from malformed pings

        if (processedPings.length > 0) {
          console.log(
            "Processed emergency pings to add/update:",
            processedPings,
          );
          setEmergencyPings((prevPings) => {
            // Update existing pings or add new ones
            const updatedPings = [...prevPings];
            processedPings.forEach((newPing) => {
              const existingPingIndex = updatedPings.findIndex(
                (ep) => ep.id === newPing.id,
              );
              if (existingPingIndex > -1) {
                updatedPings[existingPingIndex] = newPing; // Update
              } else {
                updatedPings.push(newPing); // Add
              }
            });
            return updatedPings;
          });
          processedPings.forEach((procPing) => {
            console.log(
              `[RN connectEmergencyServices] Attempting to post 'addEmergencyPing' for ID ${procPing.id}`,
            ); // ADD THIS LOG
            postMessageToWebView({
              type: "addEmergencyPing",
              ping: procPing, // procPing contains the definite id, lat, lng
            });
          });
        }
      },
    );
    // setSocket(newSocketInstance); // This was set on "connect"
  }, [
    getBackendUrl,
    isSocketConnecting,
    isSocketConnected,
    postMessageToWebView, // Added postMessageToWebView
    // setSocket, setIsSocketConnected, setIsSocketConnecting, setEmergencyPings are implicitly handled by their setters
  ]);

  const disconnectEmergencyServices = useCallback(() => {
    if (socket) {
      console.log("Disconnecting socket...");
      socket.disconnect();
      // State updates are handled by the 'disconnect' event listener.
    } else {
      console.log("No active socket to disconnect.");
    }
  }, [socket]);

  useEffect(() => {
    // Component unmount cleanup
    return () => {
      if (socket) {
        console.log("MapScreen unmounting, disconnecting socket.");
        socket.disconnect();
        // Resetting states here too as a safeguard, though 'disconnect' listener should handle it
        setSocket(null);
        setIsSocketConnected(false);
        setIsSocketConnecting(false);
      }
    };
  }, [socket]);

  const handleSocketToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSocketConnected) {
      disconnectEmergencyServices();
    } else if (!isSocketConnecting) {
      connectEmergencyServices();
    }
  };

  const getUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please grant location permission.");
        return;
      }
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert("Location Disabled", "Please enable location services.");
        return;
      }

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const timeoutPromise = new Promise<Location.LocationObject | null>(
        (_, reject) =>
          setTimeout(
            () => reject(new Error("Location request timed out (30s)")),
            30000,
          ),
      );

      const locationResult = await Promise.race([
        locationPromise,
        timeoutPromise,
      ]);

      if (!locationResult || !locationResult.coords) {
        throw new Error("Failed to get valid location coordinates.");
      }

      const userLoc = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setUserLocation(userLoc);
      setMapCenter(userLoc); // This will trigger WebView reload if mapHTML depends on mapCenter

      console.log(`User location: ${userLoc.latitude}, ${userLoc.longitude}`);
      postMessageToWebView({
        // Send to WebView
        type: "centerOnUser",
        lat: userLoc.latitude,
        lng: userLoc.longitude,
      });
    } catch (error: any) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        error.message || "Failed to get your location.",
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, [postMessageToWebView]); // Added postMessageToWebView

  // Removed redundant useEffect for socket disconnect (one is enough)

  const navigateToMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/menu" as any);
  };
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    let data;
    const rawData = event.nativeEvent.data;
    console.log("[RN] Received raw message from WebView:", rawData); // Log raw data first

    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("[RN] Error parsing WebView message:", e, rawData);
      return;
    }

    if (data.type === "simpleWebViewJsRan") {
      console.log(
        `[RN] ✅ SIMPLIFIED WebView JavaScript is WORKING! Received 'simpleWebViewJsRan' from WebView:`,
        data,
      );
      setIsWebViewReady(true);

      // Process any queued messages since basic JS is working
      if (webViewRef.current) {
        const currentWebView = webViewRef.current;
        if (messageQueueRef.current.length > 0) {
          console.log(
            `[RN] ✅ Processing ${messageQueueRef.current.length} queued messages after simplified JS test.`,
          );
          messageQueueRef.current.forEach((msg) => {
            console.log("[RN] Sending queued message:", JSON.parse(msg).type);
            currentWebView.postMessage(msg);
          });
          messageQueueRef.current = [];
        }
      }

      // Since this is a simplified version, we won't re-add markers yet
      console.log(
        "[RN] ✅ Simplified WebView is ready. Basic JS execution confirmed.",
      );
    } else if (data.type === "simpleWebViewJsError") {
      console.error(
        "[RN] ❌ SIMPLIFIED WebView JavaScript ERROR:",
        data.error,
        data,
      );
      // Do NOT set isWebViewReady to true
    } else if (data.type === "webViewLoaded") {
      console.log(
        `[RN] WebView content loaded and ready (webViewLoaded @ ${data.timestamp}). isWebViewReady was: ${isWebViewReady}`,
      );
      setIsWebViewReady(true);

      if (webViewRef.current) {
        const currentWebView = webViewRef.current;
        if (messageQueueRef.current.length > 0) {
          console.log(
            `[RN] Processing ${messageQueueRef.current.length} queued messages.`,
          );
          messageQueueRef.current.forEach((msg) => {
            console.log("[RN] Sending queued message:", JSON.parse(msg).type);
            currentWebView.postMessage(msg);
          });
          messageQueueRef.current = [];
        }
      } else {
        console.error(
          "[RN] webViewRef.current is null in webViewLoaded, cannot process queue.",
        );
      }

      if (userLocation) {
        console.log(
          "[RN] WebView (re)loaded, re-adding user location marker:",
          userLocation,
        );
        postMessageToWebView({
          type: "centerOnUser",
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
      }

      if (emergencyPings.length > 0) {
        console.log(
          `[RN] WebView (re)loaded, attempting to re-add ${emergencyPings.length} emergency pings from state.`,
        );
        emergencyPings.forEach((ping, index) => {
          console.log(
            `[RN Re-add Loop ${index}] Ping from state:`,
            JSON.stringify(ping),
          ); // DETAILED LOG OF PING FROM STATE
          if (
            ping && // Ensure ping object exists
            typeof ping.lat === "number" &&
            typeof ping.lng === "number" &&
            ping.id // Ensure ID exists
          ) {
            const pingToSend = {
              // Construct a clean object to send
              lat: ping.lat,
              lng: ping.lng,
              id: ping.id,
              emergency_type: ping.emergency_type || "Unknown Emergency",
              description: ping.description || "Details not available",
              timestamp: ping.timestamp || new Date().toISOString(),
            };
            console.log(
              `[RN Re-add Loop ${index}] Posting 'addEmergencyPing' for ID ${ping.id} with data:`,
              JSON.stringify(pingToSend),
            );
            postMessageToWebView({
              type: "addEmergencyPing",
              ping: pingToSend,
            });
          } else {
            console.error(
              `[RN Re-add Loop ${index}] Invalid ping data in state (lat, lng, or id missing/invalid):`,
              JSON.stringify(ping),
            );
          }
        });
      } else {
        console.log(
          "[RN] WebView (re)loaded, no emergency pings in state to re-add.",
        );
      }
    } else if (data.type === "webViewLog" || data.type === "webViewError") {
      console.log(`[WebView INTERNAL] ${data.message}`); // More explicit prefix
    } else {
      console.log("[RN] Received unhandled message from WebView: ", data);
    }
  };
  const mapHTML = useMemo(() => {
    console.log(
      `Generating STEP 3 mapHTML (Leaflet + map + listener) with center: ${mapCenter.latitude}, ${mapCenter.longitude}`,
    );
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style> 
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; } 
            #map { height: 100%; width: 100%; }
            #messageDiv { 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%);
              padding: 20px; 
              font-size: 18px; 
              background-color: #f0f0f0; 
              text-align: center;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              z-index: 1000;
            } 
          </style>
      </head>
      <body>
          <div id="map"></div>
          <div id="messageDiv">Step 2: Loading Leaflet...</div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
              // Function to send messages to React Native
              function postToReactNative(type, payload) {
                const message = JSON.stringify({ type: type, ...payload });
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(message);
                } else {
                  // Can't use overridden console.error here if it's not set up yet
                  alert('ReactNativeWebView.postMessage not available!');
                }
              }

              // Override console.log, console.error to post to React Native
              var originalConsoleLog = console.log;
              var originalConsoleError = console.error;
              var originalConsoleWarn = console.warn;

              console.log = function() {
                var args = Array.from(arguments);
                var message = args.map(function(arg) {
                    if (typeof arg === 'object' && arg !== null) { 
                      try { return JSON.stringify(arg); } 
                      catch (e) { return arg.toString(); } 
                    }
                    return arg;
                }).join(' ');
                postToReactNative('webViewLog', { message: '[LOG] ' + message });
                originalConsoleLog.apply(console, args);
              };

              console.error = function() {
                var args = Array.from(arguments);
                var message = args.map(function(arg) {
                    if (typeof arg === 'object' && arg !== null) { 
                      try { return JSON.stringify(arg); } 
                      catch (e) { return arg.toString(); } 
                    }
                    return arg;
                }).join(' ');
                postToReactNative('webViewError', { message: '[ERROR] ' + message });
                originalConsoleError.apply(console, args);
              };              console.log("CHECKPOINT 1: Console overrides attempted.");

              // Update the visual indicator
              document.getElementById('messageDiv').textContent = 'Step 2: Leaflet loaded, initializing map...';
              document.getElementById('messageDiv').style.backgroundColor = '#87CEEB';

              // STEP 2: Initialize Leaflet map
              var map = null;
              try {
                console.log("CHECKPOINT 2: About to initialize Leaflet map.");
                map = L.map('map', { preferCanvas: true }).setView([${mapCenter.latitude}, ${mapCenter.longitude}], 13);
                console.log('CHECKPOINT 3: Leaflet map initialized successfully. Map object exists:', !!map);
                
                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                console.log('CHECKPOINT 4: Tile layer added to map.');
                  // Update visual indicator
                document.getElementById('messageDiv').textContent = 'Step 3: Map + Listener ✓';
                document.getElementById('messageDiv').style.backgroundColor = '#90EE90';
                  } catch(e) {
                console.error('Error initializing Leaflet map:', e.toString(), e.stack);
                document.getElementById('messageDiv').textContent = 'Step 2: Map initialization ERROR';
                document.getElementById('messageDiv').style.backgroundColor = '#FFB6C1';
              }

              // STEP 3: Add message listener for RN messages
              console.log("CHECKPOINT 5: About to add **DOCUMENT** message listener.");
              var messageCounter = 0;
              var emergencyPingMarkers = {};
              var userMarker = null; 

              document.addEventListener('message', function(event) { 
                messageCounter++;
                console.log('CHECKPOINT 6 (document listener): WebView listener fired! Count:', messageCounter, 'Raw event.data:', event.data);

                try {
                  var data;
                  if (typeof event.data === 'string') {
                      console.log('CHECKPOINT 6.1: event.data is a string, attempting JSON.parse.');
                      data = JSON.parse(event.data);
                  } else if (typeof event.data === 'object' && event.data !== null) {
                      console.log('CHECKPOINT 6.1: event.data is already an object.');
                      data = event.data; 
                  } else {
                      console.error('CHECKPOINT ERROR: event.data is not a string or object. Data:', event.data);
                      return;
                  }

                  console.log('CHECKPOINT 7: Parsed/obtained data successfully:', JSON.stringify(data));

                  if (!map && (data.type === 'addEmergencyPing' || data.type === 'centerOnUser')) {
                      console.error('CHECKPOINT ERROR: Map object is NULL when trying to process message type:', data.type, '. Message ignored.');
                      return;
                  }

                  if (data.type === 'addEmergencyPing') {
                    console.log('CHECKPOINT 8: Processing addEmergencyPing for ID:', data.ping.id, 'Coords:', data.ping.lat, data.ping.lng);
                    if (data.ping && typeof data.ping.lat === 'number' && typeof data.ping.lng === 'number' && data.ping.id) {
                        if (emergencyPingMarkers[data.ping.id]) {
                            console.log('CHECKPOINT 8.1: Removing existing marker for ID:', data.ping.id);
                            map.removeLayer(emergencyPingMarkers[data.ping.id]);
                        }
                        var marker = L.marker([data.ping.lat, data.ping.lng], {
                              icon: L.divIcon({ 
                                  className: 'emergency-ping-icon-unique',
                                  html: '<div style="background-color: #FF3B30; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                                  iconSize: [22, 22],
                                  iconAnchor: [11, 11]
                              }),
                              zIndexOffset: 950
                        })
                        .addTo(map)
                        .bindPopup('<b>' + (data.ping.emergency_type || 'Emergency') + '</b><br>' + (data.ping.description || 'Details unavailable'));
                        emergencyPingMarkers[data.ping.id] = marker;
                        console.log('CHECKPOINT 9: Emergency marker ADDED/UPDATED successfully for ID:', data.ping.id);
                    } else {
                        console.error('CHECKPOINT ERROR 8.2: Invalid ping data for addEmergencyPing:', JSON.stringify(data.ping));
                    }
                  } else if (data.type === 'centerOnUser') {
                    console.log('CHECKPOINT 10: Processing centerOnUser:', data.lat, data.lng);
                     if (typeof data.lat === 'number' && typeof data.lng === 'number') {
                          if (userMarker) { map.removeLayer(userMarker); } 
                          userMarker = L.marker([data.lat, data.lng], {
                              icon: L.divIcon({
                                  className: 'user-location-icon',
                                  html: '<div style="background-color: #0095F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                                  iconSize: [22, 22], iconAnchor: [11, 11]
                              }),
                              zIndexOffset: 1000
                          }).addTo(map);
                          map.setView([data.lat, data.lng], 15);
                          console.log('CHECKPOINT 11: Map centered on user and user marker added/updated.');
                      } else {
                          console.error('CHECKPOINT ERROR 10.1: Invalid lat/lng for centerOnUser:', data);
                      }
                  } else if (data.type === 'testSelfMessage') { 
                      console.log('CHECKPOINT (SelfTest): Received self-test message:', JSON.stringify(data));
                  }
                  else {
                    console.log('CHECKPOINT 12: Unhandled message type:', data.type, 'Full data:', JSON.stringify(data));
                  }
                } catch (parseOrProcessError) {
                  console.error('CHECKPOINT ERROR (Outer Try/Catch):', parseOrProcessError.toString(), 'Raw event.data:', event.data);
                }
              });
              console.log("CHECKPOINT 13: **DOCUMENT** Message listener added successfully.");

              console.log("CHECKPOINT 14: Testing message listener with self-message (posted to window)...");
              try {
                window.postMessage(JSON.stringify({
                  type: 'testSelfMessage',
                  test: 'WebView self-test message (to window)'
                }), '*'); 
                console.log("CHECKPOINT 15: Self-message posted successfully (to window).");
              } catch (e) {
                console.error("CHECKPOINT ERROR 15: Failed to post self-message:", e.toString());
              }

              console.log("CHECKPOINT FINAL: About to send webViewLoaded.");
              postToReactNative('webViewLoaded', { 
                status: 'success', 
                timestamp: new Date().toISOString(),
                step: 'leaflet-map-with-listener'
              });
              console.log('WebView "webViewLoaded" message sent to RN (using document listener).');
          </script>
      </body>
      </html>
    `;
  }, [mapCenter.latitude, mapCenter.longitude]);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
          onLoadStart={() => console.log("WebView onLoadStart")}
          onLoadEnd={() =>
            console.log(
              "WebView onLoadEnd (HTML structure loaded, JS might still be running)",
            )
          }
          onLoadProgress={({ nativeEvent }) => {
            if (nativeEvent.progress === 1) {
              // This indicates the page itself has loaded, but our custom 'webViewLoaded'
              // from inside the HTML is more reliable for JS readiness.
            }
          }}
        />
        {/* Map Controls Overlay */}
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
          <TouchableOpacity
            style={[
              styles.mapControlButton,
              { backgroundColor: theme.card, marginTop: 10 },
            ]}
            onPress={getUserLocation}
            accessibilityLabel="Get current location"
          >
            <Ionicons
              name="locate-outline"
              size={28}
              color={isLoadingLocation ? theme.primary : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      {isLoadingLocation && <LoadingIndicator theme={theme} />}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Your existing styles)
  // Add/modify these for clarity:
  container: {
    flex: 1,
  },
  menuButton: {
    padding: 8, // Make tap target larger
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8, // Adjust if menu button has padding
  },
  headerSpacer: {
    width: 30 + 16, // Approx Ionicons size + padding
  },
  header: {
    paddingBottom: 12, // paddingTop is handled by insets
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner border
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600", // Slightly less bold
  },
  mapOuterContainer: {
    // New style for map and controls
    flex: 1,
    position: "relative", // For absolute positioning of controls
  },
  mapWebView: {
    // Renamed from 'map' to avoid conflict if #map ID is used in styles
    flex: 1, // Ensure WebView takes full space of its container
    width: "100%",
    height: "100%",
  },
  mapControlsContainer: {
    // Container for all map buttons
    position: "absolute",
    right: 16,
    bottom: 16 + (Platform.OS === "ios" ? 0 : 10), // Adjust for different platforms if needed, + SafeAreaInsets.bottom if buttons are very low
    alignItems: "flex-end", // Align buttons to the right if they have varying widths
  },
  mapControlButton: {
    // Unified style for map buttons
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
  loadingContainer: {
    // For LoadingIndicator
    ...StyleSheet.absoluteFillObject, // Make it cover the whole screen
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Ensure it's on top
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  // ... (Keep your other styles like socketButton, mapButton, legend, etc., or adapt them to mapControlButton)
  // Ensure that old mapControls, socketButton, mapButton styles are removed or adapted if using mapControlsContainer and mapControlButton
});

interface LoadingIndicatorProps {
  theme: typeof themeColors.light; // Be more specific with theme type
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

export default MapScreen;
