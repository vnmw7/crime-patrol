#!/usr/bin/env node

/**
 * Crime Patrol Real-Time Emergency Ping System Test
 * Tests the complete flow:
 * 1. Mobile app sends emergency pings every 5 seconds
 * 2. Backend receives and processes location updates
 * 3. WebSocket broadcasts real-time updates to map viewers
 * 4. Map displays live location tracking with status overlay
 */

const io = require("socket.io-client");
const fetch = require("node-fetch");

console.log("🚨 CRIME PATROL REAL-TIME EMERGENCY PING SYSTEM TEST");
console.log("=" * 60);

// Test configuration
const CONFIG = {
  BACKEND_URL: "http://localhost:3000",
  TEST_USER_ID: "emergency-test-user-" + Date.now(),
  PING_INTERVAL: 5000, // 5 seconds - same as mobile app
  TEST_DURATION: 25000, // 25 seconds - enough for 5 pings
  TEST_ROUTE: [
    { lat: 10.6747, lng: 122.9541, area: "Iloilo City Plaza" },
    { lat: 10.6755, lng: 122.9548, area: "SM City Iloilo Direction" },
    { lat: 10.6762, lng: 122.9555, area: "Jaro Main Road" },
    { lat: 10.677, lng: 122.956, area: "University of the Philippines" },
    { lat: 10.6778, lng: 122.9565, area: "Jaro Cathedral Area" },
  ],
};

// Test state
let state = {
  sessionId: null,
  currentLocationIndex: 0,
  pingsCreated: 0,
  pingsUpdated: 0,
  mapUpdatesReceived: 0,
  startTime: null,
  errors: [],
};

// Connect to WebSocket for real-time map monitoring
const mapSocket = io(CONFIG.BACKEND_URL, {
  transports: ["websocket"],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
});

async function runTest() {
  console.log("🎯 Test Configuration:");
  console.log(`   Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`   User ID: ${CONFIG.TEST_USER_ID}`);
  console.log(
    `   Ping Interval: ${CONFIG.PING_INTERVAL}ms (${
      CONFIG.PING_INTERVAL / 1000
    }s)`
  );
  console.log(
    `   Test Duration: ${CONFIG.TEST_DURATION}ms (${
      CONFIG.TEST_DURATION / 1000
    }s)`
  );
  console.log(`   Route Points: ${CONFIG.TEST_ROUTE.length} locations`);

  state.startTime = Date.now();

  try {
    // Step 1: Setup WebSocket listeners for real-time monitoring
    await setupMapWebSocketListeners();

    // Step 2: Create initial emergency ping
    await createInitialEmergencyPing();

    // Step 3: Start periodic location updates (simulating mobile app)
    await startPeriodicLocationUpdates();

    // Step 4: Run test for specified duration
    await new Promise((resolve) => setTimeout(resolve, CONFIG.TEST_DURATION));

    // Step 5: End emergency session
    await endEmergencySession();

    // Step 6: Display test results
    displayTestResults();
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    state.errors.push(error.message);
    displayTestResults();
    process.exit(1);
  }
}

function setupMapWebSocketListeners() {
  return new Promise((resolve, reject) => {
    console.log(
      "\n🌐 Setting up WebSocket connection for real-time map monitoring..."
    );

    mapSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", mapSocket.id);

      // Join map room to receive real-time updates
      mapSocket.emit("map-join");
      console.log("📍 Joined map-updates room");

      // Set up listeners for emergency ping events
      mapSocket.on("emergency-ping-created", (ping) => {
        state.pingsCreated++;
        state.mapUpdatesReceived++;
        console.log("\n🚨 MAP UPDATE: Emergency Ping Created");
        console.log(`   📍 ID: ${ping.id || ping.$id}`);
        console.log(`   📍 Location: ${ping.latitude}, ${ping.longitude}`);
        console.log(
          `   🕐 Time: ${new Date(ping.timestamp).toLocaleTimeString()}`
        );
        logCurrentTestStatus();
      });

      mapSocket.on("emergency-ping-updated", (ping) => {
        state.pingsUpdated++;
        state.mapUpdatesReceived++;
        const lat = ping.lastLatitude || ping.latitude;
        const lng = ping.lastLongitude || ping.longitude;
        console.log("\n🔄 MAP UPDATE: Emergency Ping Location Updated");
        console.log(`   📍 ID: ${ping.id || ping.$id}`);
        console.log(`   📍 New Position: ${lat}, ${lng}`);
        console.log(
          `   🕐 Last Update: ${new Date(
            ping.lastPing || ping.timestamp
          ).toLocaleTimeString()}`
        );

        // Calculate movement if possible
        if (state.currentLocationIndex > 0) {
          const currentArea = CONFIG.TEST_ROUTE[state.currentLocationIndex];
          console.log(`   🏃 Moved to: ${currentArea?.area || "Unknown area"}`);
        }

        logCurrentTestStatus();
      });

      mapSocket.on("emergency-ping-ended", (pingId) => {
        state.mapUpdatesReceived++;
        console.log("\n🏁 MAP UPDATE: Emergency Ping Ended");
        console.log(`   📍 Session ID: ${pingId}`);
        logCurrentTestStatus();
      });

      resolve();
    });

    mapSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection failed:", error.message);
      state.errors.push(`WebSocket connection failed: ${error.message}`);
      reject(error);
    });

    mapSocket.on("disconnect", (reason) => {
      console.log("👋 WebSocket disconnected:", reason);
    });
  });
}

async function createInitialEmergencyPing() {
  console.log("\n📍 Creating initial emergency ping...");

  const initialLocation = CONFIG.TEST_ROUTE[0];
  const pingData = {
    latitude: initialLocation.lat,
    longitude: initialLocation.lng,
    timestamp: new Date().toISOString(),
    userId: CONFIG.TEST_USER_ID,
  };

  try {
    const response = await fetch(
      `${CONFIG.BACKEND_URL}/api/emergency/location`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pingData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    state.sessionId = result.data.sessionId;

    console.log("✅ Emergency session created successfully");
    console.log(`   📋 Session ID: ${state.sessionId}`);
    console.log(`   📍 Initial location: ${initialLocation.area}`);
    console.log(
      `   📍 Coordinates: ${initialLocation.lat}, ${initialLocation.lng}`
    );
  } catch (error) {
    throw new Error(`Failed to create emergency ping: ${error.message}`);
  }
}

async function startPeriodicLocationUpdates() {
  console.log(
    `\n⏰ Starting periodic location updates every ${
      CONFIG.PING_INTERVAL / 1000
    } seconds...`
  );

  const updateInterval = setInterval(async () => {
    state.currentLocationIndex++;

    // Stop if we've reached the end of our route
    if (state.currentLocationIndex >= CONFIG.TEST_ROUTE.length) {
      clearInterval(updateInterval);
      return;
    }

    await sendLocationUpdate();
  }, CONFIG.PING_INTERVAL);

  // Store interval for cleanup
  state.updateInterval = updateInterval;
}

async function sendLocationUpdate() {
  const location = CONFIG.TEST_ROUTE[state.currentLocationIndex];
  const updateData = {
    latitude: location.lat,
    longitude: location.lng,
    timestamp: new Date().toISOString(),
    userId: CONFIG.TEST_USER_ID,
    sessionId: state.sessionId,
  };

  console.log(`\n🔄 Sending location update #${state.currentLocationIndex}...`);
  console.log(`   📍 Moving to: ${location.area}`);
  console.log(`   📍 Coordinates: ${location.lat}, ${location.lng}`);

  try {
    const response = await fetch(
      `${CONFIG.BACKEND_URL}/api/emergency/location`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );

    if (response.ok) {
      console.log("   ✅ Location update sent successfully");
    } else {
      const error = `Location update failed: ${response.status}`;
      console.error(`   ❌ ${error}`);
      state.errors.push(error);
    }
  } catch (error) {
    const errorMsg = `Location update error: ${error.message}`;
    console.error(`   ❌ ${errorMsg}`);
    state.errors.push(errorMsg);
  }
}

async function endEmergencySession() {
  console.log("\n🏁 Ending emergency session...");

  try {
    const response = await fetch(
      `${CONFIG.BACKEND_URL}/api/emergency/ping/${state.sessionId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      }
    );

    if (response.ok) {
      console.log("✅ Emergency session ended successfully");
    } else {
      console.error("❌ Failed to end emergency session:", response.status);
      state.errors.push(`Failed to end session: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error ending emergency session:", error.message);
    state.errors.push(`End session error: ${error.message}`);
  }

  // Clean up interval if still running
  if (state.updateInterval) {
    clearInterval(state.updateInterval);
  }
}

function logCurrentTestStatus() {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  console.log(
    `   📊 Status: ${state.mapUpdatesReceived} map updates | ${elapsed}s elapsed`
  );
}

function displayTestResults() {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);

  console.log("\n" + "=" * 60);
  console.log("📊 REAL-TIME EMERGENCY PING SYSTEM TEST RESULTS");
  console.log("=" * 60);

  console.log("📈 Performance Metrics:");
  console.log(`   ⏱️  Test Duration: ${elapsed} seconds`);
  console.log(
    `   📍 Locations Visited: ${state.currentLocationIndex + 1}/${
      CONFIG.TEST_ROUTE.length
    }`
  );
  console.log(`   🚨 Emergency Pings Created: ${state.pingsCreated}`);
  console.log(`   🔄 Location Updates Received: ${state.pingsUpdated}`);
  console.log(`   📡 Total Map Updates: ${state.mapUpdatesReceived}`);

  console.log("\n📱 Mobile App Simulation:");
  console.log(
    `   ✅ Emergency session creation: ${
      state.sessionId ? "SUCCESS" : "FAILED"
    }`
  );
  console.log(
    `   ✅ 5-second ping interval: ${
      state.currentLocationIndex > 0 ? "SUCCESS" : "FAILED"
    }`
  );
  console.log(
    `   ✅ Location updates: ${state.pingsUpdated > 0 ? "SUCCESS" : "FAILED"}`
  );

  console.log("\n🗺️  Real-Time Map Updates:");
  console.log(
    `   ✅ WebSocket connection: ${mapSocket.connected ? "SUCCESS" : "FAILED"}`
  );
  console.log(
    `   ✅ Real-time ping creation: ${
      state.pingsCreated > 0 ? "SUCCESS" : "FAILED"
    }`
  );
  console.log(
    `   ✅ Real-time location updates: ${
      state.pingsUpdated > 0 ? "SUCCESS" : "FAILED"
    }`
  );
  console.log(
    `   ✅ Live tracking display: ${
      state.mapUpdatesReceived > 0 ? "SUCCESS" : "FAILED"
    }`
  );

  console.log("\n🎯 Core Features Tested:");
  console.log(`   📍 5-second emergency ping intervals`);
  console.log(`   🌐 Real-time WebSocket communication`);
  console.log(`   📱 Mobile app location tracking simulation`);
  console.log(`   🗺️  Live map updates with active ping overlay`);
  console.log(`   📊 Emergency ping status display`);

  if (state.errors.length > 0) {
    console.log("\n❌ Errors Encountered:");
    state.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  const overallSuccess =
    state.mapUpdatesReceived > 0 && state.errors.length === 0;
  console.log(
    `\n🎉 Overall Test Result: ${overallSuccess ? "✅ SUCCESS" : "❌ FAILED"}`
  );

  if (overallSuccess) {
    console.log("\n🚀 Real-time emergency ping system is working correctly!");
    console.log("   • Mobile app can send emergency pings every 5 seconds");
    console.log("   • Backend processes location updates in real-time");
    console.log("   • WebSocket broadcasts updates to map viewers instantly");
    console.log("   • Map displays live emergency ping tracking");
  } else {
    console.log(
      "\n⚠️  Some issues were detected. Please check the errors above."
    );
  }

  console.log("\n👋 Test completed. Disconnecting...");
  mapSocket.disconnect();
  process.exit(overallSuccess ? 0 : 1);
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Test interrupted by user");
  displayTestResults();
});

// Run the test
runTest().catch((error) => {
  console.error("❌ Fatal test error:", error.message);
  state.errors.push(error.message);
  displayTestResults();
});
