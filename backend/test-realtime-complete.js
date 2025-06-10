// Comprehensive Real-Time Emergency Ping Test
const io = require("socket.io-client");
const fetch = require("node-fetch");

// Test Configuration
const BACKEND_URL = "http://localhost:3000";
const TEST_USER_ID = "test-realtime-user";
const PING_INTERVAL = 5000; // 5 seconds
const TEST_DURATION = 30000; // 30 seconds

console.log("🚨 Crime Patrol Real-Time Emergency Ping Test");
console.log("=" * 50);

// Test coordinates (simulating movement around Iloilo City)
const testCoordinates = [
  { lat: 10.6747, lng: 122.9541, location: "Iloilo City Center" },
  { lat: 10.6755, lng: 122.9548, location: "Moving North" },
  { lat: 10.6762, lng: 122.9555, location: "Near Plaza Libertad" },
  { lat: 10.677, lng: 122.956, location: "Approaching Jaro" },
  { lat: 10.6778, lng: 122.9565, location: "Jaro District" },
  { lat: 10.6785, lng: 122.957, location: "Final Position" },
];

let currentCoordIndex = 0;
let sessionId = null;
let pingCount = 0;
let updateCount = 0;

// Connect to WebSocket for real-time monitoring
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ WebSocket Connected:", socket.id);

  // Join map room to receive real-time updates
  socket.emit("map-join");
  console.log("📍 Joined map-updates room for real-time monitoring");

  // Set up event listeners for real-time updates
  setupRealtimeListeners();

  // Start the emergency ping simulation
  setTimeout(startEmergencyPingTest, 2000);
});

socket.on("connect_error", (error) => {
  console.error("❌ WebSocket connection failed:", error.message);
  process.exit(1);
});

function setupRealtimeListeners() {
  console.log("\n🎯 Setting up real-time event listeners...");

  socket.on("emergency-ping-created", (ping) => {
    console.log("\n🚨 REAL-TIME: New Emergency Ping Created");
    console.log(`   📍 ID: ${ping.id || ping.$id}`);
    console.log(`   📍 Location: ${ping.latitude}, ${ping.longitude}`);
    console.log(`   🕐 Time: ${new Date(ping.timestamp).toLocaleTimeString()}`);
    console.log(`   👤 User: ${ping.userId}`);
    pingCount++;
  });

  socket.on("emergency-ping-updated", (ping) => {
    console.log("\n🔄 REAL-TIME: Emergency Ping Updated");
    console.log(`   📍 ID: ${ping.id || ping.$id}`);
    const lat = ping.lastLatitude || ping.latitude;
    const lng = ping.lastLongitude || ping.longitude;
    console.log(`   📍 New Location: ${lat}, ${lng}`);
    console.log(
      `   🕐 Last Ping: ${new Date(
        ping.lastPing || ping.timestamp
      ).toLocaleTimeString()}`
    );
    updateCount++;

    // Calculate distance moved (simple approximation)
    if (currentCoordIndex > 0) {
      const prevCoord = testCoordinates[currentCoordIndex - 1];
      const distance = calculateDistance(
        prevCoord.lat,
        prevCoord.lng,
        lat,
        lng
      );
      console.log(`   📏 Distance moved: ${distance.toFixed(2)} meters`);
    }
  });

  socket.on("emergency-ping-ended", (pingId) => {
    console.log("\n🏁 REAL-TIME: Emergency Ping Ended");
    console.log(`   📍 ID: ${pingId}`);
  });
}

async function startEmergencyPingTest() {
  console.log("\n🧪 Starting Emergency Ping Simulation...");
  console.log(`   Duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`   Ping Interval: ${PING_INTERVAL / 1000} seconds`);
  console.log(`   Test Route: ${testCoordinates.length} locations`);

  try {
    // Create initial emergency ping
    const initialCoord = testCoordinates[0];
    const initialPing = {
      latitude: initialCoord.lat,
      longitude: initialCoord.lng,
      timestamp: new Date().toISOString(),
      userId: TEST_USER_ID,
    };

    console.log(
      `\n📍 Creating initial emergency ping at ${initialCoord.location}...`
    );
    const response = await fetch(`${BACKEND_URL}/api/emergency/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initialPing),
    });

    if (!response.ok) {
      throw new Error(`Failed to create emergency ping: ${response.status}`);
    }

    const result = await response.json();
    sessionId = result.data.sessionId;

    console.log(`✅ Emergency session created successfully`);
    console.log(`   📋 Session ID: ${sessionId}`);
    console.log(`   📍 Initial location: ${initialCoord.location}`);

    // Start sending location updates every 5 seconds
    const updateInterval = setInterval(async () => {
      currentCoordIndex++;

      if (currentCoordIndex >= testCoordinates.length) {
        clearInterval(updateInterval);
        await endEmergencyPingTest();
        return;
      }

      await sendLocationUpdate();
    }, PING_INTERVAL);

    // Auto-stop test after duration
    setTimeout(async () => {
      clearInterval(updateInterval);
      await endEmergencyPingTest();
    }, TEST_DURATION);
  } catch (error) {
    console.error("❌ Error starting emergency ping test:", error.message);
    process.exit(1);
  }
}

async function sendLocationUpdate() {
  const coord = testCoordinates[currentCoordIndex];
  const updatePing = {
    latitude: coord.lat,
    longitude: coord.lng,
    timestamp: new Date().toISOString(),
    userId: TEST_USER_ID,
    sessionId: sessionId,
  };

  console.log(`\n🔄 Sending location update #${currentCoordIndex}...`);
  console.log(`   📍 Moving to: ${coord.location}`);
  console.log(`   📍 Coordinates: ${coord.lat}, ${coord.lng}`);

  try {
    const response = await fetch(`${BACKEND_URL}/api/emergency/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePing),
    });

    if (response.ok) {
      console.log(`   ✅ Location update sent successfully`);
    } else {
      console.error(`   ❌ Location update failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`   ❌ Error sending location update:`, error.message);
  }
}

async function endEmergencyPingTest() {
  console.log("\n🏁 Ending emergency ping test...");

  try {
    // End the emergency session
    const response = await fetch(
      `${BACKEND_URL}/api/emergency/ping/${sessionId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      }
    );

    if (response.ok) {
      console.log("✅ Emergency session ended successfully");
    }
  } catch (error) {
    console.error("❌ Error ending emergency session:", error.message);
  }

  // Show test summary
  console.log("\n📊 TEST SUMMARY");
  console.log("=" * 30);
  console.log(`📍 Total locations visited: ${currentCoordIndex + 1}`);
  console.log(`🚨 Emergency pings created: ${pingCount}`);
  console.log(`🔄 Location updates received: ${updateCount}`);
  console.log(`⏱️ Test duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`📡 WebSocket connectivity: ✅ Working`);
  console.log(
    `🎯 Real-time updates: ✅ ${updateCount > 0 ? "Working" : "Failed"}`
  );

  socket.disconnect();
  process.exit(0);
}

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(Value) {
  return (Value * Math.PI) / 180;
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Test interrupted by user");
  if (sessionId) {
    await endEmergencyPingTest();
  } else {
    socket.disconnect();
    process.exit(0);
  }
});
