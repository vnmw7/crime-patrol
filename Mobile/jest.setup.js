// Mock @expo/vector-icons for Jest tests
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  // Create a generic mock component for all icon sets
  const MockIcon = ({ name, size, color, style }) =>
    React.createElement(Text, { style: style }, `[${name}]`);

  // Return an object where each key is an icon set name (e.g., Ionicons)
  // and the value is the mock component.
  // You might need to add more icon set names if your app uses others.
  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon, // Add other icon sets used in your project if needed
    AntDesign: MockIcon,
    Entypo: MockIcon,
    EvilIcons: MockIcon,
    Feather: MockIcon,
    FontAwesome5: MockIcon,
    Fontisto: MockIcon,
    Foundation: MockIcon,
    Octicons: MockIcon,
    SimpleLineIcons: MockIcon,
    Zocial: MockIcon,
    // Add any other icon sets you use
  };
});

// You can add other global mocks or setup here if needed
// For example, mocking react-native-reanimated:
// jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock native modules specific to Expo
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(),
  resolveScheme: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
  ),
}));

jest.mock("posthog-react-native", () => ({
  usePostHog: () => ({
    capture: jest.fn(),
    screen: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  }),
  PostHogProvider: ({ children }) => children, // Simple pass-through provider
}));

// Mock Appwrite - adjust based on actual usage if needed
jest.mock("./lib/appwrite", () => ({
  getCurrentUser: jest.fn(() =>
    Promise.resolve({ name: "Mock User", prefs: {} }),
  ),
  getCurrentSession: jest.fn(() =>
    Promise.resolve({
      /* mock session object */
    }),
  ),
  // Add mocks for other Appwrite functions used
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest
      .fn()
      .mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockImplementation(() => inset),
  };
});
