import { render } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";
import React from "react";

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock posthog-react-native
jest.mock("posthog-react-native", () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

// Mock appwrite functions
jest.mock("../lib/appwrite", () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
  getCurrentSession: jest.fn().mockResolvedValue(null),
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: "medium",
  },
}));

// Improved mock for @expo/vector-icons
jest.mock("@expo/vector-icons/Ionicons", () => {
  const React = require("react");
  return function MockIonicons(props: any) {
    return React.createElement("Ionicons", props, null);
  };
});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  const React = require("react");
  return function MockMaterialCommunityIcons(props: any) {
    return React.createElement("MaterialCommunityIcons", props, null);
  };
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  return function MockMaterialIcons(props: any) {
    return React.createElement("MaterialIcons", props, null);
  };
});

test("index loads correctly", () => {
  const { getByTestId } = render(<HomeScreen />);
  const element = getByTestId("mainIndex");
  expect(element).toBeTruthy();
});
