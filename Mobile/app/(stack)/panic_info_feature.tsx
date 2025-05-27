import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const themeColors = {
  light: {
    primary: "#0095F6",
    secondary: "#FF3B30",
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#262626",
    textSecondary: "#8E8E8E",
    border: "#DBDBDB",
  },
  dark: {
    primary: "#0095F6",
    secondary: "#FF453A",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    border: "#2C2C2C",
  },
};

const PanicInfoFeature = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Panic Alert Info
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name="warning"
            size={48}
            color={theme.secondary}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: theme.text }]}>
            Emergency Panic Alert
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Learn how to use the panic alert feature for immediate emergency
            assistance. This feature will instantly notify local authorities and
            emergency contacts.
          </Text>
          <Text style={[styles.comingSoon, { color: theme.primary }]}>
            Coming Soon
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 24,
    alignItems: "center",
    textAlign: "center",
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PanicInfoFeature;
