import { Text, View, Button } from "react-native";
import * as Sentry from "@sentry/react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      testID="mainIndex"
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button
        title="Try!"
        onPress={() => {
          Sentry.captureException(new Error("First error"));
        }}
      />
    </View>
  );
}
