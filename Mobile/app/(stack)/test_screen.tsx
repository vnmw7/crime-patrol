import React from "react";
import { View, Button, Alert, Platform, Linking } from "react-native";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";

const TestScreen = () => {
  const phoneNumber = "09668306841"; // Replace with the desired phone number

  const handleImmediatePhoneCall = () => {
    RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Call Number Immediately"
        onPress={handleImmediatePhoneCall}
      />
      <View style={{ marginVertical: 10 }} />
      <Button title="Open Dialer" onPress={handleNormalPhoneCall} />
    </View>
  );
};

export default TestScreen;
