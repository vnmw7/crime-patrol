import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  useColorScheme,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getCurrentUser,
  getCurrentSession,
  pingAppwrite,
} from "../../lib/appwrite";
import { usePostHog } from "posthog-react-native";

// Mock user state - in a real app, this would come from authentication
const mockUser = {
  isLoggedIn: false,
  name: "User",
  avatar: null,
};

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
  },
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(mockUser);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("Home Screen Viewed");
  }, [posthog]);

  // Animated values for button feedback
  const panicButtonScale = useRef(new Animated.Value(1)).current;
  const reportButtonScale = useRef(new Animated.Value(1)).current;

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const navigateToMenu = () => {
    triggerHaptic();
    router.push("/menu" as any); // Corrected path with type assertion
  };

  // Function to handle the panic button press with animation
  const handlePanic = () => {
    triggerHaptic();
    // Add animation
    Animated.sequence([
      Animated.timing(panicButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(panicButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Add logic for sending location to authorities
    console.log("PANIC button pressed - sending location");
    // Show confirmation alert
  };
  // Function to toggle user login status (for demo purposes)
  const toggleLogin = () => {
    triggerHaptic();
    setUser({
      ...user,
      isLoggedIn: !user.isLoggedIn,
    });
  };

  // Function to ping Appwrite server
  const handlePingAppwrite = async () => {
    setIsPinging(true);
    setPingResult(null);
    triggerHaptic();

    try {
      const result = await pingAppwrite();
      setPingResult(result);

      if (result.success) {
        posthog.capture("Appwrite Ping Success", {
          endpoint: result.endpoint,
          projectId: result.projectId,
        });
      } else {
        posthog.capture("Appwrite Ping Failed", {
          error: result.message,
        });
      }
    } catch (error) {
      console.error("Ping error:", error);
      setPingResult({
        success: false,
        message: `Unexpected error: ${error}`,
        timestamp: new Date().toISOString(),
      });
      posthog.capture("Appwrite Ping Error", {
        error: String(error),
      });
    } finally {
      setIsPinging(false);
    }
  };

  // Function to navigate to the report screen with animation
  const navigateToReport = () => {
    triggerHaptic();

    // Add animation
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

    // Initial ping to test Appwrite connection on app start
    const initialPing = async () => {
      try {
        console.log("🚀 Performing initial Appwrite ping...");
        const result = await pingAppwrite();
        setPingResult(result);

        if (result.success) {
          console.log("✅ Initial ping successful");
          posthog.capture("App Started - Appwrite Connected", {
            endpoint: result.endpoint,
            projectId: result.projectId,
          });
        } else {
          console.warn("⚠️ Initial ping failed");
          posthog.capture("App Started - Appwrite Failed", {
            error: result.message,
          });
        }
      } catch (error) {
        console.error("❌ Initial ping error:", error);
        setPingResult({
          success: false,
          message: `Initial connection test failed: ${error}`,
          timestamp: new Date().toISOString(),
        });
        posthog.capture("App Started - Ping Error", {
          error: String(error),
        });
      }
    };

    checkSession();
    initialPing();
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
        </TouchableOpacity>
        <Text style={[styles.instagramLogo, { color: theme.text }]}>
          Crime Patrol
        </Text>
        {user.isLoggedIn ? (
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
        {/* Instagram Story-like User Status */}
        {user.isLoggedIn && (
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
        )}

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            {user.isLoggedIn
              ? `Welcome, ${user.name}`
              : "Stay Safe, Stay Alert"}
          </Text>
          {!user.isLoggedIn && (
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

        {/* Emergency Buttons (Instagram Post-like Cards) */}
        <View style={styles.emergencySection}>
          <View
            style={[
              styles.emergencyCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="shield-alert"
                size={22}
                color={theme.secondary}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Emergency Options
              </Text>
            </View>

            {/* Main Action Buttons */}
            <Animated.View style={{ transform: [{ scale: panicButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.panicButton,
                  { backgroundColor: theme.secondary },
                ]}
                onPress={handlePanic}
                activeOpacity={0.8}
                accessibilityLabel="Panic button"
                accessibilityRole="button"
                accessibilityHint="Press to send emergency alert with your location"
              >
                <Ionicons name="warning" size={26} color="#FFF" />
                <Text style={styles.panicButtonText}>PANIC</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

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
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Location Services
            </Text>
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
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>
          {user.isLoggedIn && (
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

        {/* Appwrite Connection Status Card */}
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
            <Ionicons name="server" size={22} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Server Connection
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.infoButton,
              {
                borderBottomColor: theme.border,
                opacity: isPinging ? 0.7 : 1,
              },
            ]}
            onPress={handlePingAppwrite}
            disabled={isPinging}
            activeOpacity={0.7}
            accessibilityLabel="Test Appwrite connection"
            accessibilityRole="button"
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              {isPinging ? (
                <Ionicons
                  name="sync"
                  size={20}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Ionicons
                  name="radio"
                  size={20}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={[styles.infoButtonText, { color: theme.text }]}>
                {isPinging
                  ? "Testing Connection..."
                  : "Test Appwrite Connection"}
              </Text>
            </View>
            {!isPinging && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.primary}
              />
            )}
          </TouchableOpacity>

          {/* Ping Result Display */}
          {pingResult && (
            <View
              style={[
                styles.pingResultContainer,
                {
                  backgroundColor: pingResult.success
                    ? theme.primary + "10"
                    : theme.secondary + "10",
                  borderColor: pingResult.success
                    ? theme.primary + "30"
                    : theme.secondary + "30",
                },
              ]}
            >
              <View style={styles.pingResultHeader}>
                <Ionicons
                  name={
                    pingResult.success ? "checkmark-circle" : "close-circle"
                  }
                  size={18}
                  color={pingResult.success ? theme.primary : theme.secondary}
                />
                <Text
                  style={[
                    styles.pingResultStatus,
                    {
                      color: pingResult.success
                        ? theme.primary
                        : theme.secondary,
                      marginLeft: 6,
                    },
                  ]}
                >
                  {pingResult.success
                    ? "Connection Successful"
                    : "Connection Failed"}
                </Text>
              </View>
              <Text
                style={[
                  styles.pingResultMessage,
                  { color: theme.textSecondary },
                ]}
              >
                {pingResult.message}
              </Text>
              <Text
                style={[styles.pingResultTime, { color: theme.textSecondary }]}
              >
                {new Date(pingResult.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
});

export default HomeScreen;
