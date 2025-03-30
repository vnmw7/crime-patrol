import { render } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";

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

test("index loads correctly", () => {
  const { getByTestId } = render(<HomeScreen />);
  const element = getByTestId("mainIndex");
  expect(element).toBeTruthy();
});
