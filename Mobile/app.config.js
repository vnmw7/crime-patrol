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
      bundleIdentifier: "com.crimepatrol.mobile",
      config: {
        googleMapsApiKey:
          process.env.GOOGLE_MAPS_IOS_API_KEY || "YOUR_IOS_API_KEY_HERE",
      },
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "The app accesses your photos to let you share them.",
        NSCameraUsageDescription:
          "The app accesses your camera to let you take photos/videos.",
        NSMicrophoneUsageDescription:
          "The app needs access to your microphone to record audio.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.anonymous.Mobile",
      config: {
        googleMaps: {
          apiKey:
            process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
            "YOUR_ANDROID_API_KEY_HERE",
        },
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
      ],
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
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them.",
          cameraPermission:
            "The app accesses your camera to let you take photos/videos.",
        },
      ],
      [
        "expo-av",
        {
          microphonePermission:
            "The app needs access to your microphone to record audio.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    }, // Add the extra field to expose environment variables
    extra: {
      ...config.expo?.extra, // Spread any existing extra config
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_BUCKET_ID: process.env.APPWRITE_BUCKET_ID,
      // Collection IDs for normalized database structure
      APPWRITE_REPORTS_COLLECTION_ID:
        process.env.APPWRITE_REPORTS_COLLECTION_ID,
      APPWRITE_REPORT_METADATA_COLLECTION_ID:
        process.env.APPWRITE_REPORT_METADATA_COLLECTION_ID,
      APPWRITE_REPORT_LOCATIONS_COLLECTION_ID:
        process.env.APPWRITE_REPORT_LOCATIONS_COLLECTION_ID,
      APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID:
        process.env.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID,
      APPWRITE_REPORT_VICTIMS_COLLECTION_ID:
        process.env.APPWRITE_REPORT_VICTIMS_COLLECTION_ID,
      APPWRITE_REPORT_SUSPECTS_COLLECTION_ID:
        process.env.APPWRITE_REPORT_SUSPECTS_COLLECTION_ID,
      APPWRITE_REPORT_WITNESSES_COLLECTION_ID:
        process.env.APPWRITE_REPORT_WITNESSES_COLLECTION_ID,
      APPWRITE_REPORT_MEDIA_COLLECTION_ID:
        process.env.APPWRITE_REPORT_MEDIA_COLLECTION_ID,
      // Other API keys
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      // Add other environment variables you need here
    },
  },
});
