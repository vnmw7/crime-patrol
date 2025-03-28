import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://ae8534f842d2e455c1e4d247786fd3b3@o4509016564629504.ingest.us.sentry.io/4509054551195648",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
});

function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(stack)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default Sentry.wrap(RootLayout);
