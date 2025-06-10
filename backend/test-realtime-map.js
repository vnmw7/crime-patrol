// Test script for real-time emergency ping map updates
const io = require("socket.io-client");

// Connect to the backend WebSocket
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to backend WebSocket:", socket.id);

  // Join the map room
  socket.emit("map-join");
  console.log("📍 Joined map-updates room");

  // Set up listeners for emergency ping events
  socket.on("emergency-ping-created", (ping) => {
    console.log("\n🚨 NEW EMERGENCY PING CREATED:");
    console.log(`   ID: ${ping.id || ping.$id}`);
    console.log(`   Location: ${ping.latitude}, ${ping.longitude}`);
    console.log(`   Time: ${ping.timestamp}`);
    console.log(`   User: ${ping.userId || "anonymous"}`);
  });

  socket.on("emergency-ping-updated", (ping) => {
    console.log("\n🔄 EMERGENCY PING UPDATED:");
    console.log(`   ID: ${ping.id || ping.$id}`);
    console.log(
      `   New Location: ${ping.lastLatitude || ping.latitude}, ${
        ping.lastLongitude || ping.longitude
      }`
    );
    console.log(`   Last Ping: ${ping.lastPing || ping.timestamp}`);
  });

  socket.on("emergency-ping-ended", (pingId) => {
    console.log("\n🏁 EMERGENCY PING ENDED:");
    console.log(`   ID: ${pingId}`);
  });

  console.log("\n🎯 Map WebSocket test is running...");
  console.log("   - Listening for real-time emergency ping updates");
  console.log("   - Press Ctrl+C to stop");

  // Test creating an emergency ping after 2 seconds
  setTimeout(() => {
    console.log("\n📍 Testing emergency ping creation...");
    testEmergencyPing();
  }, 2000);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend WebSocket");
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

// Function to test emergency ping creation
async function testEmergencyPing() {
  try {
    const testPing = {
      latitude: 10.6747,
      longitude: 122.9541,
      timestamp: new Date().toISOString(),
      userId: "test-user-map-websocket",
    };

    console.log("🧪 Sending test emergency ping to backend API...");

    const fetch = require("node-fetch");
    const response = await fetch(
      "http://localhost:3000/api/emergency/location",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPing),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Test emergency ping created successfully");
      console.log(`   Session ID: ${result.data.sessionId}`);

      // Test location updates every 5 seconds
      let updateCount = 0;
      const updateInterval = setInterval(async () => {
        updateCount++;
        if (updateCount > 3) {
          clearInterval(updateInterval);
          console.log(
            "\n🏁 Test completed. Emergency ping simulation finished."
          );
          return;
        }

        const updatePing = {
          latitude: testPing.latitude + (Math.random() - 0.5) * 0.001,
          longitude: testPing.longitude + (Math.random() - 0.5) * 0.001,
          timestamp: new Date().toISOString(),
          userId: testPing.userId,
          sessionId: result.data.sessionId,
        };

        console.log(`\n🔄 Sending location update #${updateCount}...`);
        const updateResponse = await fetch(
          "http://localhost:3000/api/emergency/location",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePing),
          }
        );

        if (updateResponse.ok) {
          console.log(`✅ Location update #${updateCount} sent successfully`);
        } else {
          console.error(`❌ Location update #${updateCount} failed`);
        }
      }, 5000);
    } else {
      console.error(
        "❌ Failed to create test emergency ping:",
        response.status
      );
    }
  } catch (error) {
    console.error("❌ Error testing emergency ping:", error.message);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down map WebSocket test...");
  socket.disconnect();
  process.exit(0);
});
