// Test WebSocket connection from mobile app perspective
const io = require("socket.io-client");

const MOBILE_BACKEND_URL = "http://localhost:3000"; // localhost for testing

console.log("🚀 Testing Mobile WebSocket Connection");
console.log("==================================================");
console.log(`Connecting to: ${MOBILE_BACKEND_URL}`);

const socket = io(MOBILE_BACKEND_URL, {
  transports: ["websocket"],
  timeout: 10000,
  forceNew: false,
});

socket.on("connect", () => {
  console.log("✅ Mobile WebSocket connected:", socket.id);

  // Join map room
  socket.emit("map-join");
  console.log("📍 Joined map-updates room");

  // Set up listeners for emergency ping events
  socket.on("emergency-ping-created", (ping) => {
    console.log("\n🚨 MOBILE: New emergency ping created:", ping);
  });

  socket.on("emergency-ping-updated", (ping) => {
    console.log("\n🔄 MOBILE: Emergency ping updated:", ping);
  });

  socket.on("emergency-ping-ended", (pingId) => {
    console.log("\n🏁 MOBILE: Emergency ping ended:", pingId);
  });

  console.log("\n✅ Mobile WebSocket test is ready!");
  console.log("   - Press Ctrl+C to stop");
});

socket.on("connect_error", (error) => {
  console.error("❌ Mobile WebSocket connection failed:", error.message);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("👋 Mobile WebSocket disconnected:", reason);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down mobile WebSocket test...");
  socket.disconnect();
  process.exit(0);
});
