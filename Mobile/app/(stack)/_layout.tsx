import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="police-station"
        options={{ title: "Police Stations" }}
      />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen
        name="report-incident"
        options={{ title: "Report Incident" }}
      />
      <Stack.Screen name="(verification)" options={{ title: "Verification" }} />
      <Stack.Screen name="menu" options={{ title: "Menu" }} />
      <Stack.Screen name="my-reports" options={{ title: "My Reports" }} />
      <Stack.Screen
        name="report-details"
        options={{ title: "Reort Details" }}
      />
    </Stack>
  );
};

export default _layout;
