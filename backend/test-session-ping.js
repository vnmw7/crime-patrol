// Test script to verify session-based emergency ping functionality
const fetch = require("node-fetch");

const BACKEND_URL = "http://localhost:3000";
const EMERGENCY_ENDPOINT = `${BACKEND_URL}/api/emergency/location`;

async function testSessionBasedPing() {
  console.log("🧪 Testing Session-Based Emergency Ping Functionality");
  console.log("=".repeat(60));

  // Test 1: Create new emergency ping session
  console.log(
    "\n📍 Step 1: Creating new emergency ping session (initial ping)"
  );

  const initialPingPayload = {
    latitude: 14.5995, // Manila coordinates
    longitude: 120.9842,
    timestamp: new Date().toISOString(),
    userId: "test-session-user",
    // No sessionId - this should create a new session
  };

  try {
    console.log(
      "📤 Sending initial ping:",
      JSON.stringify(initialPingPayload, null, 2)
    );

    const initialResponse = await fetch(EMERGENCY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initialPingPayload),
    });

    if (initialResponse.ok) {
      const initialData = await initialResponse.json();
      console.log("✅ Initial ping successful!");
      console.log("📋 Response:", JSON.stringify(initialData, null, 2));

      const sessionId = initialData.data.sessionId;
      if (sessionId) {
        console.log(`🔑 Session ID received: ${sessionId}`);

        // Test 2: Send continuous ping updates using session ID
        console.log(
          "\n📍 Step 2: Sending continuous ping updates (should update existing record)"
        );

        // Simulate 3 location updates with slightly different coordinates
        const updates = [
          { lat: 14.5996, lng: 120.9843 },
          { lat: 14.5997, lng: 120.9844 },
          { lat: 14.5998, lng: 120.9845 },
        ];

        for (let i = 0; i < updates.length; i++) {
          const updatePayload = {
            latitude: updates[i].lat,
            longitude: updates[i].lng,
            timestamp: new Date().toISOString(),
            userId: "test-session-user",
            sessionId: sessionId, // Include session ID for updates
          };

          console.log(
            `\n📤 Sending update ${i + 1}:`,
            JSON.stringify(updatePayload, null, 2)
          );

          const updateResponse = await fetch(EMERGENCY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          });

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            console.log(`✅ Update ${i + 1} successful!`);
            console.log("📋 Response:", JSON.stringify(updateData, null, 2));
          } else {
            const errorText = await updateResponse.text();
            console.error(
              `❌ Update ${i + 1} failed:`,
              updateResponse.status,
              errorText
            );
          }

          // Wait 1 second between updates to simulate real continuous pinging
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        console.log("\n🎉 Session-based ping test completed!");
        console.log("\n📊 Expected behavior:");
        console.log(
          "  • Initial ping should create NEW emergency record with sessionId"
        );
        console.log(
          "  • Update pings should UPDATE existing record's lastLatitude, lastLongitude, lastPing"
        );
        console.log(
          "  • Only ONE emergency record should exist in database for this session"
        );
      } else {
        console.error("❌ No session ID received in response!");
      }
    } else {
      const errorText = await initialResponse.text();
      console.error(
        "❌ Initial ping failed:",
        initialResponse.status,
        errorText
      );
    }
  } catch (error) {
    console.error("💥 Error during session ping test:", error.message);
  }
}

// Test backend connectivity first
async function testBackendConnectivity() {
  try {
    const response = await fetch(BACKEND_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log("🚀 Session-Based Emergency Ping Test Suite");
  console.log("=".repeat(50));

  const isBackendUp = await testBackendConnectivity();

  if (isBackendUp) {
    console.log("✅ Backend is running");
    await testSessionBasedPing();
  } else {
    console.log("❌ Backend is not responding");
    console.log("\nTo start the backend:");
    console.log("cd c:\\projects\\crime-patrol\\backend");
    console.log("npm start");
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Test completed!");
}

runTests();
