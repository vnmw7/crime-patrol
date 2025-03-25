import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="report"
        options={{ title: "Report", headerShown: false }}
      />
    </Tabs>
  );
};

export default _layout;
