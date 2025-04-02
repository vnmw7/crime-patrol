import "dotenv/config"; // Load environment variables from .env

export default ({ config }) => ({
  ...config, // Spread the existing static config
  expo: {
    ...config.expo, // Spread the existing expo config
    name: "Mobile",
    slug: "Mobile",
    version: "0.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.anonymous.Mobile",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: "SENTRY_ORG",
          project: "SENTRY_PROJECT",
          url: "https://sentry.io/",
        },
      ],
      "expo-localization",
    ],
    experiments: {
      typedRoutes: true,
    },
    // Add the extra field to expose environment variables
    extra: {
      ...config.expo?.extra, // Spread any existing extra config
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID: process.env.APPWRITE_COLLECTION_ID,
      // Add other environment variables you need here
    },
  },
});
