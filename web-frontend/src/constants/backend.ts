import { Platform } from "react-native";

export const getBackendUrl = (): string => {
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://192.168.254.120:3000"
      : "http://192.168.254.120:3000";
  } else {
    return "https://crime-patrol.onrender.com/";
  }
};
