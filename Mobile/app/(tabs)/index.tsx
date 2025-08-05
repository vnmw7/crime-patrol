import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Platform,
  useColorScheme,
  Modal,
  Alert,
  Linking,
  PermissionsAndroid,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCurrentUser, getCurrentSession } from "../../lib/appwrite";
import { usePostHog } from "posthog-react-native";
import BttnEmergencyPing, {
  getCurrentLocation,
} from "../_components/bttn_emergency_ping";

interface User {
  isLoggedIn: boolean;
  name: string;
  avatar?: string | null;
}

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
  },
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const posthog = usePostHog();
  const [dictCurrentLocation, setDictCurrentLocation] = useState<{
    dblLatitude: number;
    dblLongitude: number;
  }>({ dblLatitude: 0, dblLongitude: 0 });

  // Call permission modal state
  const [showCallPermissionModal, setShowCallPermissionModal] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  useEffect(() => {
    posthog.capture("Home Screen Viewed");

    // Check CALL_PHONE permission on screen load
    const checkInitialPermissions = async () => {
      const hasCallPermission = await checkCallPermission();
      if (!hasCallPermission) {
        setShowCallPermissionModal(true);
      }
    };

    checkInitialPermissions();
  }, [posthog]);

  // Re-check permission when app comes to foreground or modal is visible
  useEffect(() => {
    if (showCallPermissionModal) {
      const recheckPermission = async () => {
        const hasCallPermission = await checkCallPermission();
        if (hasCallPermission) {
          setShowCallPermissionModal(false);
        }
      };

      // Check immediately
      recheckPermission();

      // Set up an interval to check periodically while modal is visible
      const interval = setInterval(recheckPermission, 2000);

      return () => clearInterval(interval);
    }
  }, [showCallPermissionModal]);

  const reportButtonScale = useRef(new Animated.Value(1)).current;
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Function to check CALL_PHONE permission
  const checkCallPermission = async () => {
    if (Platform.OS !== "android") {
      return true; // iOS doesn't need explicit CALL_PHONE permission
    }

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      );
      return hasPermission;
    } catch (error) {
      console.error("Error checking CALL_PHONE permission:", error);
      return false;
    }
  };

  // Function to request CALL_PHONE permission
  const requestCallPermission = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    setIsCheckingPermissions(true);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: "Phone Call Permission",
          message:
            "Crime Patrol needs phone call permission to enable emergency calling features",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "Grant Permission",
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("CALL_PHONE permission granted");
        setShowCallPermissionModal(false);
        return true;
      } else {
        console.log("CALL_PHONE permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting CALL_PHONE permission:", error);
      return false;
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  // Function to open app settings
  const openAppSettings = () => {
    triggerHaptic();
    Alert.alert(
      "Permission Required",
      "Please enable phone call permission in your device settings to use emergency calling features.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  const navigateToMenu = () => {
    triggerHaptic();
    router.push("/menu" as any);
  };
  const toggleLogin = () => {
    triggerHaptic();
    router.push("/(stack)/auth");
  };
  const navigateToReport = () => {
    triggerHaptic();

    Animated.sequence([
      Animated.timing(reportButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(reportButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push({ pathname: "/report-incident" });
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session) {
          const userData = await getCurrentUser();
          if (userData) {
            setUser({
              isLoggedIn: true,
              name: userData.name || "User",
              avatar: userData.prefs?.avatar || null,
            });
          }
        } else {
          router.replace("/(stack)/auth");
        }
      } catch (error) {
        console.log("No active session found:", error);
        router.replace("/(stack)/auth");
      }
    };
    const getLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = currentLocation.coords;

        // Update location state
        setDictCurrentLocation({
          dblLatitude: latitude,
          dblLongitude: longitude,
        });

        console.log("Location obtained:", { latitude, longitude });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    checkSession();
    getLocation();
  }, [router, posthog]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.background,
        },
      ]}
      testID="mainIndex"
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* Instagram-style Header */}
      <View
        style={[
          styles.instagramHeader,
          {
            borderBottomColor: theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
        <TouchableOpacity
          onPress={navigateToMenu}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          style={styles.menuButton} // Added style for menu button
        >
          <Ionicons name="menu" size={30} color={theme.text} />
        </TouchableOpacity>{" "}
        <Text style={[styles.instagramLogo, { color: theme.text }]}>
          Crime Patrol
        </Text>
        {user?.isLoggedIn ? (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              console.log("Notifications pressed");
            }}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications" size={26} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={toggleLogin}
            accessibilityLabel="Log in"
            accessibilityRole="button"
          >
            <Ionicons name="log-in" size={26} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {" "}
        {/* Instagram Story-like User Status */}
        {user?.isLoggedIn && (
          <View style={styles.userStatusBar}>
            <View
              style={[
                styles.userProfileCircle,
                { backgroundColor: theme.primary },
              ]}
            >
              <Ionicons name="person" size={24} color="#FFF" />
            </View>
            <Text style={[styles.usernameText, { color: theme.text }]}>
              {user.name}
            </Text>
          </View>
        )}{" "}
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            {user?.isLoggedIn
              ? `Welcome, ${user.name}`
              : "Stay Safe, Stay Alert"}
          </Text>
          {!user?.isLoggedIn && (
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary }]}
              onPress={toggleLogin}
              accessibilityLabel="Login or Sign Up"
              accessibilityRole="button"
            >
              <Text style={styles.signInText}>Login/Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>
        <BttnEmergencyPing />
        {/* Report Incident - Instagram Post-like Card */}
        <Animated.View style={{ transform: [{ scale: reportButtonScale }] }}>
          <View
            style={[
              styles.instagramCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={navigateToReport}
              accessibilityLabel="Report an Incident"
              accessibilityRole="button"
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="clipboard-alert"
                  size={22}
                  color={theme.primary}
                />
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Report an Incident
                </Text>
              </View>

              <View
                style={[
                  styles.reportButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                  },
                ]}
              >
                <Image
                  source={require("../../assets/images/partial-react-logo.png")}
                  style={styles.reportImage}
                  resizeMode="cover"
                  accessibilityLabel="Report incident illustration"
                />
                <Text style={[styles.reportButtonText, { color: theme.text }]}>
                  Report Incident
                </Text>
              </View>

              <View
                style={[styles.cardFooter, { borderTopColor: theme.border }]}
              >
                <Text
                  style={[styles.footerText, { color: theme.textSecondary }]}
                >
                  Help keep your community safe
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
        {/* Location Services - Instagram Post-like Card */}
        <View
          style={[
            styles.instagramCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          {" "}
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Location Services
            </Text>
          </View>{" "}
          {(dictCurrentLocation.dblLatitude !== 0 ||
            dictCurrentLocation.dblLongitude !== 0) && (
            <View
              style={[
                styles.locationInfo,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                },
              ]}
            >
              <Text
                style={[styles.locationText, { color: theme.textSecondary }]}
              >
                Current Location: {dictCurrentLocation.dblLatitude.toFixed(4)},{" "}
                {dictCurrentLocation.dblLongitude.toFixed(4)}
              </Text>
            </View>
          )}
          <View style={styles.locationButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                },
              ]}
              onPress={() => {
                triggerHaptic();
                console.log("View Map pressed");
              }}
              activeOpacity={0.7}
              accessibilityLabel="Crime Map"
              accessibilityRole="button"
            >
              <Ionicons name="map" size={26} color={theme.primary} />
              <Text style={[styles.locationButtonText, { color: theme.text }]}>
                Crime Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                },
              ]}
              onPress={async () => {
                triggerHaptic();
                const currentLocation = await getCurrentLocation();
                if (currentLocation) {
                  setDictCurrentLocation({
                    dblLatitude: currentLocation.dblLatitude,
                    dblLongitude: currentLocation.dblLongitude,
                  });
                  console.log("Location refreshed:", currentLocation);
                } else {
                  console.log("Failed to get location");
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="Refresh Location"
              accessibilityRole="button"
            >
              <Ionicons name="refresh" size={26} color={theme.primary} />
              <Text style={[styles.locationButtonText, { color: theme.text }]}>
                Refresh Location
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                },
              ]}
              onPress={() => {
                triggerHaptic();
                console.log("View Police Stations pressed");
                router.push("/police-stations");
              }}
              activeOpacity={0.7}
              accessibilityLabel="Police Stations"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="local-police"
                size={26}
                color={theme.primary}
              />
              <Text style={[styles.locationButtonText, { color: theme.text }]}>
                Police Stations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
                },
              ]}
              onPress={() => {
                triggerHaptic();
                if (
                  dictCurrentLocation.dblLatitude !== 0 ||
                  dictCurrentLocation.dblLongitude !== 0
                ) {
                  console.log("Current location:", {
                    latitude: dictCurrentLocation.dblLatitude,
                    longitude: dictCurrentLocation.dblLongitude,
                  });
                  // You can use the location data here for other features
                } else {
                  console.log("No location available");
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="Show Current Location"
              accessibilityRole="button"
            >
              <Ionicons name="locate" size={26} color={theme.primary} />
              <Text style={[styles.locationButtonText, { color: theme.text }]}>
                My Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Information Card */}
        <View
          style={[
            styles.instagramCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle"
              size={22}
              color={theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Information
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.infoButton, { borderBottomColor: theme.border }]}
            onPress={() => {
              triggerHaptic();
              console.log("Information pressed");
            }}
            activeOpacity={0.7}
            accessibilityLabel="Laws and Safety Guidelines"
            accessibilityRole="button"
          >
            <Text style={[styles.infoButtonText, { color: theme.text }]}>
              Laws & Safety Guidelines
            </Text>{" "}
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>
          {user?.isLoggedIn && (
            <TouchableOpacity
              style={[styles.infoButton, { borderBottomColor: theme.border }]}
              onPress={() => {
                triggerHaptic();
                console.log("My Reports pressed");
              }}
              activeOpacity={0.7}
              accessibilityLabel="My Reports"
              accessibilityRole="button"
            >
              <Text style={[styles.infoButtonText, { color: theme.text }]}>
                My Reports
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}{" "}
          <TouchableOpacity
            style={[styles.infoButton, { borderBottomColor: theme.border }]}
            onPress={() => {
              triggerHaptic();
              console.log("Settings pressed");
            }}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Text style={[styles.infoButtonText, { color: theme.text }]}>
              Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.infoButton,
            { borderBottomColor: theme.border, marginBottom: 20 },
          ]}
          onPress={() => {
            triggerHaptic();
            router.push("/test_screen");
          }}
          activeOpacity={0.7}
          accessibilityLabel="About"
          accessibilityRole="button"
        >
          <Text style={[styles.infoButtonText, { color: theme.text }]}>
            Test Screen
          </Text>{" "}
        </TouchableOpacity>
      </ScrollView>

      {/* Call Permission Modal */}
      <Modal
        visible={showCallPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Prevent closing via back button
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="phone-alert"
                size={48}
                color={theme.secondary}
              />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Phone Permission Required
              </Text>
            </View>

            <Text
              style={[styles.modalDescription, { color: theme.textSecondary }]}
            >
              Crime Patrol needs phone call permission to enable emergency
              calling features. This permission is essential for the safety
              features of the app.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.secondaryButton,
                  { borderColor: theme.border },
                ]}
                onPress={openAppSettings}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Open Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={requestCallPermission}
                disabled={isCheckingPermissions}
                activeOpacity={0.7}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  {isCheckingPermissions ? "Requesting..." : "Grant Permission"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    // Style for the menu button
    paddingRight: 10, // Added padding for easier touch and spacing
  },
  instagramHeader: {
    flexDirection: "row",
    justifyContent: "space-between", // Adjusted for menu button
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  instagramLogo: {
    fontSize: 26,
    fontWeight: "700",
    fontStyle: "italic",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  userStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  userProfileCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
  usernameText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  signInButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  signInText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  emergencySection: {
    marginBottom: 20,
  },
  emergencyCard: {
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 12,
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
  instagramCard: {
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  panicButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  panicButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
    marginLeft: 10,
  },
  callPoliceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },
  reportButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  reportImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#EFEFEF",
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "700",
    padding: 14,
    textAlign: "center",
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 0.5,
  },
  footerText: {
    fontSize: 14,
  },
  locationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  locationButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  locationInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    textAlign: "center",
  },
  infoButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0.5,
  },
  infoButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pingResultContainer: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pingResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  pingResultStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  pingResultMessage: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  pingResultTime: {
    fontSize: 10,
    fontStyle: "italic",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    // backgroundColor will be set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
