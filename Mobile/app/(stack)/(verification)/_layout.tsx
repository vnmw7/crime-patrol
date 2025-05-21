import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="screen1" options={{ headerShown: false }} />
      <Stack.Screen name="screen2" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
