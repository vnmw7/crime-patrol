import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="police-station"
        options={{ title: "Police Stations" }}
      />
    </Stack>
  );
};

export default _layout;
