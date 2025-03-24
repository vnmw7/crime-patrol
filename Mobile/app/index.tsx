import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Mock user state - in a real app, this would come from authentication
const mockUser = {
  isLoggedIn: false,
  name: "User",
  avatar: null,
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(mockUser);
  const router = useRouter();

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Function to handle the panic button press
  const handlePanic = () => {
    triggerHaptic();
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

  // Function to navigate to the report screen
  const navigateToReport = () => {
    triggerHaptic();
    router.push("/(stack)/report");
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID="mainIndex"
    >
      <StatusBar style="dark" />

      {/* Instagram-style Header */}
      <View style={styles.instagramHeader}>
        <Text style={styles.instagramLogo}>Crime Patrol</Text>
        {user.isLoggedIn ? (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              console.log("Notifications pressed");
            }}
          >
            <Ionicons name="notifications" size={26} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleLogin}>
            <Ionicons name="log-in" size={26} color="#000" />
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
            <View style={styles.userProfileCircle}>
              <Ionicons name="person" size={24} color="#FFF" />
            </View>
            <Text style={styles.usernameText}>{user.name}</Text>
          </View>
        )}

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            {user.isLoggedIn
              ? `Welcome, ${user.name}`
              : "Stay Safe, Stay Alert"}
          </Text>
          {!user.isLoggedIn && (
            <TouchableOpacity style={styles.signInButton} onPress={toggleLogin}>
              <Text style={styles.signInText}>Login/Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency Buttons (Instagram Post-like Cards) */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="shield-alert"
                size={22}
                color="#E60023"
              />
              <Text style={styles.cardTitle}>Emergency Options</Text>
            </View>

            {/* Main Action Buttons */}
            <TouchableOpacity
              style={styles.panicButton}
              onPress={handlePanic}
              activeOpacity={0.8}
            >
              <Ionicons name="warning" size={26} color="#FFF" />
              <Text style={styles.panicButtonText}>PANIC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callPoliceButton}
              onPress={() => {
                triggerHaptic();
                console.log("Call Police pressed");
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={22} color="#FFF" />
              <Text style={styles.callButtonText}>Call Police</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Incident - Instagram Post-like Card */}
        <View style={styles.instagramCard}>
          <TouchableOpacity activeOpacity={0.9} onPress={navigateToReport}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clipboard-alert"
                size={22}
                color="#0095F6"
              />
              <Text style={styles.cardTitle}>Report an Incident</Text>
            </View>

            <View style={styles.reportButton}>
              <Image
                source={require("../assets/images/partial-react-logo.png")}
                style={styles.reportImage}
                resizeMode="cover"
              />
              <Text style={styles.reportButtonText}>Report Incident</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Help keep your community safe</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Location Services - Instagram Post-like Card */}
        <View style={styles.instagramCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color="#0095F6" />
            <Text style={styles.cardTitle}>Location Services</Text>
          </View>

          <View style={styles.locationButtonsContainer}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                triggerHaptic();
                console.log("View Map pressed");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={26} color="#0095F6" />
              <Text style={styles.locationButtonText}>Crime Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                triggerHaptic();
                console.log("View Police Stations pressed");
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-police" size={26} color="#0095F6" />
              <Text style={styles.locationButtonText}>Police Stations</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Card */}
        <View style={styles.instagramCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={22} color="#0095F6" />
            <Text style={styles.cardTitle}>Information</Text>
          </View>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {
              triggerHaptic();
              console.log("Information pressed");
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.infoButtonText}>Laws & Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={20} color="#0095F6" />
          </TouchableOpacity>

          {user.isLoggedIn && (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                triggerHaptic();
                console.log("My Reports pressed");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.infoButtonText}>My Reports</Text>
              <Ionicons name="chevron-forward" size={20} color="#0095F6" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {
              triggerHaptic();
              console.log("Settings pressed");
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.infoButtonText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#0095F6" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Instagram-style Bottom Navigation */}
      <View style={styles.instagramFooter}>
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="home" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="search" size={26} color="#8E8E8E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={navigateToReport}>
          <MaterialCommunityIcons
            name="clipboard-plus-outline"
            size={26}
            color="#8E8E8E"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="map-outline" size={26} color="#8E8E8E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab}>
          <Ionicons name="person-circle-outline" size={26} color="#8E8E8E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Instagram background color
  },
  instagramHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DBDBDB",
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
    backgroundColor: "#0095F6",
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
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
    color: "#262626",
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: "#0095F6",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  signInText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emergencySection: {
    marginBottom: 20,
  },
  emergencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#DBDBDB",
    padding: 12,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#DBDBDB",
    padding: 12,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#262626",
  },
  panicButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  panicButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 10,
  },
  callPoliceButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  reportButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 6,
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
    fontWeight: "600",
    color: "#262626",
    padding: 12,
    textAlign: "center",
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#DBDBDB",
  },
  footerText: {
    fontSize: 14,
    color: "#8E8E8E",
  },
  locationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  locationButton: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    marginTop: 6,
  },
  infoButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEFEF",
  },
  infoButtonText: {
    fontSize: 15,
    color: "#262626",
  },
  instagramFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#DBDBDB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
  },
  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
});

export default HomeScreen;
