import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Chat", headerShown: false }}
      />
    </Tabs>
  );
};

export default _layout;
