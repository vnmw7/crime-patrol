export const getBackendUrl = () => {
  if (import.meta.env.MODE === "development") {
    return "http://192.168.254.120:3000";
  } else {
    return "https://crime-patrol.onrender.com/";
  }
};
