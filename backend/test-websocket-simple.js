// Simple WebSocket connection test
const io = require("socket.io-client");

console.log("🔄 Connecting to backend WebSocket...");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ Successfully connected to WebSocket server!");
  console.log("   Socket ID:", socket.id);

  // Join map room
  socket.emit("map-join");
  console.log("📍 Joined map-updates room");

  // Test completed successfully
  setTimeout(() => {
    console.log("✅ WebSocket connection test passed!");
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on("connect_error", (error) => {
  console.error("❌ WebSocket connection failed:", error.message);
  process.exit(1);
});

socket.on("disconnect", () => {
  console.log("👋 Disconnected from WebSocket server");
});
