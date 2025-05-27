import { Link } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";

const MenuScreen = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Menu</Text>

        <Text style={styles.subtitle}>Main Navigation</Text>
        <Link href="/(tabs)" asChild>
          <Pressable style={styles.link}>
            <Text>Home</Text>
          </Pressable>
        </Link>
        <Link href="/(stack)/report-incident" asChild>
          <Pressable style={styles.link}>
            <Text>Report Incident</Text>
          </Pressable>
        </Link>
        <Link href="/(stack)/my-reports" asChild>
          <Pressable style={styles.link}>
            <Text>My Reports</Text>
          </Pressable>
        </Link>
        <Link href="/(stack)/police-stations" asChild>
          <Pressable style={styles.link}>
            <Text>Police Stations</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/map" asChild>
          <Pressable style={styles.link}>
            <Text>Map</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/chat" asChild>
          <Pressable style={styles.link}>
            <Text>Chat</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/account" asChild>
          <Pressable style={styles.link}>
            <Text>Account & Settings</Text>
          </Pressable>
        </Link>

        <Text style={styles.subtitle}>Additional Features & Screens</Text>
        <Link href="/(stack)/(verification)/screen1" asChild>
          <Pressable style={styles.link}>
            <Text>Verification Screen</Text>
          </Pressable>
        </Link>
        {/* Placeholder route - create notifications_feature.tsx in (stack) */}
        <Link href="/(stack)/notifications_feature" asChild>
          <Pressable style={styles.link}>
            <Text>Notifications</Text>
          </Pressable>
        </Link>
        {/* Placeholder route - create panic_info_feature.tsx in (stack) */}
        <Link href="/(stack)/panic_info_feature" asChild>
          <Pressable style={styles.link}>
            <Text>Panic Alert Info</Text>
          </Pressable>
        </Link>
        {/* Placeholder route - create safety_guidelines_feature.tsx in (stack) */}
        <Link href="/(stack)/safety_guidelines_feature" asChild>
          <Pressable style={styles.link}>
            <Text>Laws & Safety Guidelines</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  link: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default MenuScreen;
