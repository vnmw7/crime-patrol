import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: "https://ae8534f842d2e455c1e4d247786fd3b3@o4509016564629504.ingest.us.sentry.io/4509054551195648",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
});

function RootLayout() {
  return (
    <PostHogProvider
      apiKey="phc_RgcZKzTBHgJ2vTRw3CLkM22Z1jWdGDpz9HWZCGzCvcc"
      options={{
        // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'

        host: "https://us.i.posthog.com",
      }}
    >
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(stack)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
