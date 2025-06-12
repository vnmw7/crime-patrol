import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  NativeModules,
  PermissionsAndroid,
  Linking,
} from "react-native";
import { io, Socket } from "socket.io-client";
import * as Location from "expo-location";
import { getBackendUrl } from "../constants/backend";

const { CustomCaller } = NativeModules;

interface PanicButtonProps {
  onPanicStart?: () => void;
  onPanicStop?: () => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export const getCurrentLocation = async (): Promise<{
  dblLatitude: number;
  dblLongitude: number;
} | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return null;
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = currentLocation.coords;

    return {
      dblLatitude: latitude,
      dblLongitude: longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

const BttnEmergencyPing: React.FC<PanicButtonProps> = ({
  onPanicStart,
  onPanicStop,
  onConnectionChange,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPanicOn, setIsPanicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // Define pingLocation function
  const pingLocation = useCallback(async () => {
    if (!socket || !isConnected) {
      console.warn(
        "[PanicButton] Cannot ping - not connected to socket server",
      );
      return;
    }

    const dictLocationData = await getCurrentLocation();
    if (dictLocationData) {
      console.log(
        `[PanicButton] Sending emergency ping with location: ${JSON.stringify(dictLocationData)}`,
      );
      socket.emit("emergency-ping", dictLocationData);
    }
  }, [socket, isConnected]);

  // Effect for handling panic pinging interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPanicOn && socket && isConnected) {
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
  }, [isPanicOn, socket, isConnected, pingLocation]);

  // Effect for component unmount cleanup
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Notify parent component of connection changes
  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);
  const connectToSocket = useCallback(() => {
    if (isConnecting || isConnected) {
      return;
    }

    const backendUrl = getBackendUrl();
    console.log(`[PanicButton] Connecting to: ${backendUrl}`);
    setIsConnecting(true);

    const newSocket = io(backendUrl, {
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[PanicButton] Connected to socket server");
      setIsConnected(true);
      setIsConnecting(false);
    });

    newSocket.on("disconnect", () => {
      console.log("[PanicButton] Disconnected from socket server");
      setIsConnected(false);
      setIsConnecting(false);
      setIsPanicOn(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[PanicButton] Connection error:", error);
      setIsConnecting(false);
      setIsConnected(false);
    });

    setSocket(newSocket);
  }, [isConnecting, isConnected]);

  // Auto-connect to socket when component mounts
  useEffect(() => {
    connectToSocket();
  }, [connectToSocket]);

  const handlePanicToggle = () => {
    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Cannot activate panic mode. Trying to reconnect...",
        [{ text: "OK" }],
      );
      connectToSocket();
      return;
    }

    const newPanicState = !isPanicOn;
    setIsPanicOn(newPanicState);

    if (newPanicState) {
      onPanicStart?.();
      Alert.alert(
        "PANIC MODE ACTIVATED",
        "Emergency pings will be sent every 5 seconds until you stop.",
        [{ text: "OK" }],
      );
    } else {
      onPanicStop?.();
      Alert.alert("Panic Mode Stopped", "Emergency pinging has been stopped.", [
        { text: "OK" },
      ]);
    }
  };

  const getButtonStyle = () => {
    if (!isConnected) {
      return [styles.button, styles.disabledButton];
    }
    return [
      styles.button,
      isPanicOn ? styles.panicActiveButton : styles.panicButton,
    ];
  };

  const getButtonText = () => {
    if (isConnecting) {
      return "Connecting...";
    }
    if (!isConnected) {
      return "PANIC (Disconnected)";
    }
    return isPanicOn ? "STOP PANIC" : "PANIC";
  };

  const getTextStyle = () => {
    if (!isConnected) {
      return [styles.buttonText, styles.disabledButtonText];
    }
    return styles.buttonText;
  };

  const phoneNumber = "09668306841";
  const requestCallPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        // First check if permissions are already granted
        const callPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );
        const readPhonePermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        );

        if (callPermission && readPhonePermission) {
          console.log("All permissions already granted");
          return true;
        }

        // Request permissions
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ]);

        const callGranted =
          grants[PermissionsAndroid.PERMISSIONS.CALL_PHONE] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const readPhoneGranted =
          grants[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (callGranted && readPhoneGranted) {
          console.log("Phone and Read Phone State permissions granted");
          return true;
        } else {
          console.log("Permissions denied");
          console.log("CALL_PHONE granted:", callGranted);
          console.log("READ_PHONE_STATE granted:", readPhoneGranted);

          Alert.alert(
            "Permissions Required",
            "This app needs phone call and phone state permissions to select SIM cards for emergency calls. Please grant these permissions in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  // This will open the app settings where user can manually grant permissions
                  Linking.openSettings();
                },
              },
            ],
          );
          return false;
        }
      } catch (err) {
        console.warn("Permission request error:", err);
        Alert.alert("Permission Error", "Could not request permissions.");
        return false;
      }
    }
    return true; // For iOS or if permissions already granted
  };

  const handleImmediateCustomCall = async (simPreference = "default") => {
    if (Platform.OS !== "android") {
      Alert.alert("Not Supported", "Custom SIM selection is only for Android.");
      handleNormalPhoneCall();
      return;
    }

    const hasPermissions = await requestCallPermissions();
    if (!hasPermissions) {
      return;
    }
    if (CustomCaller && CustomCaller.callWithSim) {
      try {
        console.log(
          `Attempting call to ${phoneNumber} with SIM preference: ${simPreference}`,
        );
        const result = await CustomCaller.callWithSim(
          phoneNumber,
          simPreference,
        );
        console.log("Call initiated successfully (from JS):", result);
        // Note: The promise resolves when startActivity is called.
        // It doesn't mean the call connected, just that the intent was launched.
      } catch (error: any) {
        console.error("CustomCall Error:", error);
        Alert.alert(
          "Call Failed",
          `Code: ${error.code || "Unknown"}, Message: ${error.message || "Unknown error"}`,
        );
      }
    } else {
      Alert.alert(
        "Module Not Found",
        "CustomCaller module is not available. Did you rebuild the app?",
      );
    }
  };

  const handleNormalPhoneCall = () => {
    let dialerUrl = "";
    if (Platform.OS === "android") {
      dialerUrl = `tel:${phoneNumber}`;
    } else {
      dialerUrl = `telprompt:${phoneNumber}`;
    }
    Linking.canOpenURL(dialerUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Phone number is not available");
        } else {
          return Linking.openURL(dialerUrl);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePanicToggle}
        disabled={isConnecting}
        activeOpacity={0.8}
      >
        <Text style={getTextStyle()}>{getButtonText()}</Text>
        {isPanicOn && <Text style={styles.intervalText}>Pinging every 5s</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={getButtonStyle()}
        onPress={() => handleImmediateCustomCall("default")}
        disabled={isConnecting}
        activeOpacity={0.8}
      >
        <Text style={getTextStyle()}>
          {" "}
          <Text style={getTextStyle()}> PANIC (call version) </Text>
        </Text>
      </TouchableOpacity>

      {!isConnected && !isConnecting && (
        <TouchableOpacity
          style={styles.reconnectButton}
          onPress={connectToSocket}
        >
          <Text style={styles.reconnectText}>Tap to Reconnect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panicButton: {
    backgroundColor: "#DC2626",
    borderWidth: 3,
    borderColor: "#B91C1C",
  },
  panicActiveButton: {
    backgroundColor: "#7F1D1D",
    borderWidth: 3,
    borderColor: "#DC2626",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
    borderWidth: 3,
    borderColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  disabledButtonText: {
    color: "#6B7280",
  },
  intervalText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  reconnectButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  reconnectText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BttnEmergencyPing;
