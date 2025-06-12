import React from "react";
import {
  View,
  Button,
  Alert,
  Platform,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Text,
  StyleSheet,
} from "react-native";

const { CustomCaller } = NativeModules;

const TestScreen = () => {
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

  const testModuleAvailability = () => {
    if (CustomCaller) {
      console.log("CustomCaller module is available");
      console.log("Available methods:", Object.keys(CustomCaller));
      Alert.alert(
        "Module Status",
        `CustomCaller module is available!\nMethods: ${Object.keys(CustomCaller).join(", ")}`,
      );
    } else {
      console.log("CustomCaller module is NOT available");
      Alert.alert(
        "Module Status",
        "CustomCaller module is NOT available. Make sure you rebuilt the app after adding the native module.",
      );
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.phoneText}>Target Number: {phoneNumber}</Text>

      <Button
        title="Test Module Availability"
        onPress={testModuleAvailability}
        color="#007AFF"
      />
      <View style={styles.spacer} />

      <Button
        title="Call Immediately (Default SIM)"
        onPress={() => handleImmediateCustomCall("default")}
      />
      <View style={styles.spacer} />
      <Button
        title="Call Immediately (SIM 1)"
        onPress={() => handleImmediateCustomCall("sim1")}
      />
      <View style={styles.spacer} />
      <Button
        title="Call Immediately (SIM 2)"
        onPress={() => handleImmediateCustomCall("sim2")}
      />
      <View style={styles.spacer} />
      <Button
        title="Open Dialer (May Prompt)"
        onPress={handleNormalPhoneCall}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  phoneText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  spacer: {
    marginVertical: 10,
  },
});

export default TestScreen;
