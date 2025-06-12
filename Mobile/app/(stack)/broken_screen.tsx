import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { themeColors } from "../theme/colors";

export default function BrokenScreen() {
  const [colorScheme] = React.useState<"light" | "dark">("light"); // You can implement proper theme detection
  const colors = themeColors[colorScheme];

  // Animation for the broken icon
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [scaleAnim]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.content}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={[styles.closeButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Animated broken icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: colors.secondary + "20" },
              ]}
            >
              <Ionicons
                name="construct-outline"
                size={80}
                color={colors.secondary}
              />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Under Maintenance
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This feature is temporarily unavailable
          </Text>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              We're working hard to improve your experience. This feature will
              be back online soon.
            </Text>
          </View>

          {/* Status indicators */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: colors.secondary },
                ]}
              />
              <Text
                style={[styles.statusText, { color: colors.textSecondary }]}
              >
                Maintenance in progress
              </Text>
            </View>

            <View style={styles.statusItem}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.tertiary }]}
              />
              <Text
                style={[styles.statusText, { color: colors.textSecondary }]}
              >
                Expected completion: Soon
              </Text>
            </View>
          </View>
        </View>

        {/* Footer with action buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleGoBack}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => {
              // You can add refresh functionality here
              console.log("Refresh attempted");
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.primary}
              style={styles.refreshIcon}
            />
            <Text
              style={[styles.secondaryButtonText, { color: colors.primary }]}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  statusContainer: {
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
