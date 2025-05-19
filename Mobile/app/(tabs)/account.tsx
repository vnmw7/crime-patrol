import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { getCurrentUser, signOut } from "../../lib/appwrite";

// Initialize Appwrite client
const themeColors = {
  light: {
    primary: "#0095F6",
    secondary: "#FF3B30",
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#262626",
    textSecondary: "#8E8E8E",
    border: "#DBDBDB",
    inputBackground: "#F2F2F2",
    success: "#34C759",
    warning: "#FFCC00",
  },
  dark: {
    primary: "#0095F6",
    secondary: "#FF453A",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    border: "#2C2C2C",
    inputBackground: "#2C2C2C",
    success: "#30D158",
    warning: "#FFD60A",
  },
};

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // Profile information
  const [name, setName] = useState("Sample User");
  const [email, setEmail] = useState("email@example.com");
  const [phone, setPhone] = useState("+1234567890");

  // Verification status
  const [isEmailVerified] = useState(true);
  const [isPhoneVerified] = useState(false);
  const [isIdentityVerified] = useState(false);

  // Notification settings
  const [reportUpdates, setReportUpdates] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  const [shareLocationInReports] = useState(true);

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleUpdateProfile = () => {
    triggerHaptic();
    Alert.alert("Success", "Profile information updated successfully!");
  };

  const handleVerifyIdentity = () => {
    triggerHaptic();
    Alert.alert(
      "Identity Verification",
      "You'll be guided through our secure identity verification process. This helps ensure all reports are legitimate.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () => console.log("Starting identity verification flow"),
        },
      ],
    );
  };

  const handleLogout = async () => {
    triggerHaptic();
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: async () => {
          try {
            await signOut();
            console.log("User logged out successfully");
            router.replace("/(stack)/auth"); // Navigate to auth screen after logout
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Account</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={22} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile Information
            </Text>
          </View>

          <View style={styles.profileImageContainer}>
            <View
              style={[
                styles.profileImage,
                { backgroundColor: theme.inputBackground },
              ]}
            >
              <Ionicons name="person" size={40} color={theme.primary} />
            </View>
            <TouchableOpacity
              style={[
                styles.changePhotoButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => {
                triggerHaptic();
                console.log("Change photo pressed");
              }}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.verificationField}>
            <View style={styles.fieldWithBadge}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
              {isEmailVerified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    { backgroundColor: theme.success },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.verificationField}>
            <View style={styles.fieldWithBadge}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Phone
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              {isPhoneVerified ? (
                <View
                  style={[
                    styles.verifiedBadge,
                    { backgroundColor: theme.success },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    console.log("Verify phone pressed");
                  }}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.primary }]}
            onPress={handleUpdateProfile}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Identity Verification Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="verified-user"
              size={22}
              color={theme.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Identity Verification
            </Text>
          </View>

          <View
            style={[
              styles.verificationStatus,
              { backgroundColor: theme.inputBackground },
            ]}
          >
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                Verification Status:
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: isIdentityVerified ? theme.success : theme.warning },
                ]}
              >
                {isIdentityVerified ? "Verified" : "Not Verified"}
              </Text>
            </View>
            <Text
              style={[
                styles.verificationDescription,
                { color: theme.textSecondary },
              ]}
            >
              Verify your identity to ensure the authenticity of your reports
              and gain access to advanced features.
            </Text>
          </View>

          {!isIdentityVerified && (
            <TouchableOpacity
              style={[
                styles.verifyIdentityButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleVerifyIdentity}
            >
              <FontAwesome5 name="id-card" size={16} color="#FFFFFF" />
              <Text style={styles.verifyIdentityText}>Verify Identity</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Settings */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={22} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notification Settings
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Report Updates
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Receive notifications about your report status changes
              </Text>
            </View>
            <Switch
              value={reportUpdates}
              onValueChange={(value) => {
                triggerHaptic();
                setReportUpdates(value);
              }}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Nearby Alerts
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Get notified about incidents in your area
              </Text>
            </View>
            <Switch
              value={nearbyAlerts}
              onValueChange={(value) => {
                triggerHaptic();
                setNearbyAlerts(value);
              }}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                System Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                App updates and important announcements
              </Text>
            </View>
            <Switch
              value={systemNotifications}
              onValueChange={(value) => {
                triggerHaptic();
                setSystemNotifications(value);
              }}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={22} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Privacy Settings
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Share Location
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Include precise location data in your reports
              </Text>
            </View>
            <Switch
              value={shareLocationInReports}
              onValueChange={(value) => {
                triggerHaptic();
              }}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {/* Logout Button */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colorScheme === "dark" ? "#2C2C2C" : "#FFF5F5",
              },
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={theme.secondary} />
            <Text style={[styles.logoutText, { color: theme.secondary }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  verificationField: {
    marginBottom: 16,
  },
  fieldWithBadge: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    marginBottom: 16,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  verifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
    marginBottom: 16,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  verificationStatus: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontWeight: "600",
    fontSize: 15,
    marginRight: 6,
  },
  statusValue: {
    fontWeight: "700",
    fontSize: 15,
  },
  verificationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  verifyIdentityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
  },
  verifyIdentityText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 10,
  },
});

export default AccountScreen;
