import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="signin" options={{ headerShown: false }} />
      <Tabs.Screen name="signup" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default _layout;
