import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";
import BttnEmergencyPing from "../_components/bttn_emergency_ping";

const getBackendUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://192.168.254.120:3000";
    } else {
      return "http://192.168.254.120:3000";
    }
  } else {
    return "https://your-production-backend.com";
  }
};

export default function TestScreen() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoinedEmergencyServices, setIsJoinedEmergencyServices] =
    useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isEmergencyOn, setIsEmergencyOn] = useState(false);

  // Define pingLocation function
  const pingLocation = useCallback(() => {
    if (!socket || !isConnected) {
      Alert.alert("Error", "Not connected to socket server");
      return;
    }

    console.log("[TestScreen] Pinging location");
    const dictLocationData = { dblLatitude: 0, dblLongitude: 0 };
    socket.emit("emergency-ping", dictLocationData);
    Alert.alert("Success", "Location pinged!");
  }, [socket, isConnected]);

  // Effect for handling emergency pinging interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isEmergencyOn && socket && isConnected) {
      // Start pinging immediately
      pingLocation();
      // Then set up interval for every 5 seconds
      interval = setInterval(() => {
        pingLocation();
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isEmergencyOn, socket, isConnected, pingLocation]);

  // Effect for component unmount cleanup only
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const connectToSocket = () => {
    const backendUrl = getBackendUrl();
    console.log(`[TestScreen] Connecting to: ${backendUrl}`);
    setConnectionStatus("Connecting...");

    const newSocket = io(backendUrl, {
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[TestScreen] Connected to socket server");
      setIsConnected(true);
      setConnectionStatus("Connected");
      Alert.alert("Success", "Connected to socket server!");
    });

    newSocket.on("disconnect", () => {
      console.log("[TestScreen] Disconnected from socket server");
      setIsConnected(false);
      setIsJoinedEmergencyServices(false);
      setConnectionStatus("Disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("[TestScreen] Connection error:", error);
      setConnectionStatus("Connection Error");
      Alert.alert("Connection Error", `Failed to connect: ${error.message}`);
    });

    newSocket.on("emergency-alert", (data) => {
      console.log("[TestScreen] Emergency alert received:", data);
      Alert.alert(
        "Emergency Alert!",
        `Message: ${data.message}\nReporter ID: ${data.strReporterId}\nLat: ${data.dblLatitude}, Lng: ${data.dblLongitude}`,
      );
    });

    setSocket(newSocket);
  };

  const disconnectFromSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsJoinedEmergencyServices(false);
      setConnectionStatus("Disconnected");
      Alert.alert("Disconnected", "Socket connection closed");
    }
  };
  const joinEmergencyServices = () => {
    if (!socket || !isConnected) {
      Alert.alert("Error", "Not connected to socket server");
      return;
    }

    console.log("[TestScreen] Joining emergency-services room");
    socket.emit("join-emergency-services");
    setIsJoinedEmergencyServices(true);
    Alert.alert("Success", "Joined emergency-services room!");
  };

  const getStatusColor = () => {
    if (isConnected) {
      return isJoinedEmergencyServices ? "#10B981" : "#F59E0B";
    }
    return "#EF4444";
  };

  const getStatusMessage = () => {
    if (!isConnected) {
      return "Not Connected";
    }
    return isJoinedEmergencyServices
      ? "Connected & Joined Emergency Services"
      : "Connected";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Emergency Services Socket Test</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        </View>
        <Text style={styles.connectionStatus}>Status: {connectionStatus}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={connectToSocket}
            disabled={isConnected}
          >
            <Text style={styles.buttonText}>
              {isConnected ? "Already Connected" : "Connect to Socket"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.emergencyButton,
              !isConnected && styles.disabledButton,
            ]}
            onPress={joinEmergencyServices}
            disabled={!isConnected || isJoinedEmergencyServices}
          >
            <Text
              style={[
                styles.buttonText,
                !isConnected && styles.disabledButtonText,
              ]}
            >
              {isJoinedEmergencyServices
                ? "Already Joined Emergency Services"
                : "Join Emergency Services"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectFromSocket}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>{" "}
          <TouchableOpacity
            style={[
              styles.button,
              styles.emergencyButton,
              !isConnected && styles.disabledButton,
            ]}
            onPress={pingLocation}
            disabled={!isConnected}
          >
            <Text
              style={[
                styles.buttonText,
                !isConnected && styles.disabledButtonText,
              ]}
            >
              Ping Location
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              isEmergencyOn ? styles.disconnectButton : styles.emergencyButton,
              !isConnected && styles.disabledButton,
            ]}
            onPress={() => setIsEmergencyOn(!isEmergencyOn)}
            disabled={!isConnected}
          >
            <Text
              style={[
                styles.buttonText,
                !isConnected && styles.disabledButtonText,
              ]}
            >
              {isEmergencyOn
                ? "Stop Emergency Pinging"
                : "Start Emergency Pinging (5s interval)"}
            </Text>
          </TouchableOpacity>
          <BttnEmergencyPing />
        </View>{" "}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>
            1. Tap "Connect to Socket" to establish connection
          </Text>
          <Text style={styles.infoText}>
            2. Tap "Join Emergency Services" to join the emergency room
          </Text>
          <Text style={styles.infoText}>
            3. Use "Ping Location" for single ping or "Start Emergency Pinging"
            for 5-second intervals
          </Text>
          <Text style={styles.infoText}>
            4. Check the backend console for connection logs
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#1F2937",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  connectionStatus: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#6B7280",
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButton: {
    backgroundColor: "#3B82F6",
  },
  emergencyButton: {
    backgroundColor: "#DC2626",
  },
  disconnectButton: {
    backgroundColor: "#6B7280",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  infoContainer: {
    backgroundColor: "#E5E7EB",
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#6B7280",
  },
});
