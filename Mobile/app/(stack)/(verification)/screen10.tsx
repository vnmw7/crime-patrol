import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons or any other icon library

const VerifiedScreen = () => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="checkmark-circle-outline"
        size={120}
        color="green"
        style={styles.icon}
      />
      <Text style={styles.title}>Verified</Text>
      <Text style={styles.description}>
        You currently have access to Crime Reporting features.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VerifiedScreen;
