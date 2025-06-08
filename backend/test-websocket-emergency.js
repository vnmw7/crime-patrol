const io = require("socket.io-client");

const BACKEND_URL = "http://localhost:3000";

console.log("🚀 Testing Emergency WebSocket Implementation");
console.log("==================================================");

// Create a mock emergency ping via REST API first
async function createEmergencyPing() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/emergency/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude: 14.5995,
        longitude: 120.9842,
        timestamp: new Date().toISOString(),
        userId: "test-user-websocket",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Emergency ping created via REST API");
      console.log("Session ID:", data.data.sessionId);
      return data.data.sessionId;
    } else {
      const errorText = await response.text();
      console.error("❌ Failed to create emergency ping:", errorText);
      return null;
    }
  } catch (error) {
    console.error("❌ Error creating emergency ping:", error.message);
    return null;
  }
}

// Test WebSocket connection and location updates
async function testWebSocketEmergency() {
  const sessionId = await createEmergencyPing();
  if (!sessionId) {
    console.log("❌ Cannot test WebSocket without session ID");
    return;
  }

  console.log("\n📡 Testing WebSocket Connection...");
  const socket = io(BACKEND_URL);

  socket.on("connect", () => {
    console.log("✅ WebSocket connected:", socket.id);

    // Join emergency session
    socket.emit("join-emergency-session", sessionId);
    console.log(`📍 Joined emergency session: ${sessionId}`);

    // Send location updates
    let updateCount = 0;
    const locationUpdateInterval = setInterval(() => {
      updateCount++;
      const locationUpdate = {
        sessionId: sessionId,
        latitude: 14.5995 + updateCount * 0.001, // Simulate movement
        longitude: 120.9842 + updateCount * 0.001,
        timestamp: new Date().toISOString(),
        userId: "test-user-websocket",
      };

      console.log(
        `📡 Sending location update #${updateCount}:`,
        locationUpdate
      );
      socket.emit("emergency-location-update", locationUpdate);

      if (updateCount >= 5) {
        clearInterval(locationUpdateInterval);

        // Leave session and disconnect
        setTimeout(() => {
          socket.emit("leave-emergency-session", sessionId);
          socket.disconnect();
          console.log("\n✅ Test completed successfully!");
          process.exit(0);
        }, 2000);
      }
    }, 2000);
  });

  socket.on("emergency-location-updated", (data) => {
    console.log("✅ Location update confirmed:", data);
  });

  socket.on("emergency-error", (data) => {
    console.error("❌ Emergency error:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ WebSocket connection error:", error.message);
    process.exit(1);
  });

  socket.on("disconnect", (reason) => {
    console.log("📡 WebSocket disconnected:", reason);
  });
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    if (response.ok) {
      console.log("✅ Backend is running");
      return true;
    } else {
      console.log("❌ Backend is not responding");
      return false;
    }
  } catch (error) {
    console.log("❌ Backend is not running");
    console.log("To start the backend:");
    console.log("cd c:\\projects\\crime-patrol\\backend");
    console.log("npm start");
    return false;
  }
}

// Main test function
async function runTest() {
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    console.log("==================================================");
    console.log("❌ Test failed - Backend not running");
    process.exit(1);
  }

  await testWebSocketEmergency();
}

runTest();
