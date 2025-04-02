import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="police-station"
        options={{ title: "Police Stations" }}
      />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="report" options={{ title: "Report" }} />
    </Stack>
  );
};

export default _layout;
