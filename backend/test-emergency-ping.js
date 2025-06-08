// Test script to verify emergency ping functionality
const fetch = require("node-fetch");

const BACKEND_URL = "http://localhost:3000";
const EMERGENCY_ENDPOINT = `${BACKEND_URL}/api/emergency/location`;

async function testEmergencyPing() {
  console.log("🚨 Testing Emergency Ping Functionality...");
  console.log(`Endpoint: ${EMERGENCY_ENDPOINT}`);

  // Test payload simulating mobile app data
  const testPayload = {
    latitude: 14.5995, // Manila, Philippines coordinates
    longitude: 120.9842,
    timestamp: new Date().toISOString(),
    userId: "test-user-mobile",
    emergencyContact: "+639485685828",
    accuracy: 10.5,
    altitude: 50,
    heading: null,
    speed: null,
  };

  try {
    console.log("\n📤 Sending emergency ping with payload:");
    console.log(JSON.stringify(testPayload, null, 2));

    const response = await fetch(EMERGENCY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(
      `\n📡 Response Status: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      const responseData = await response.json();
      console.log("✅ SUCCESS! Emergency ping sent successfully:");
      console.log(JSON.stringify(responseData, null, 2));

      console.log("\n🎯 Key Info:");
      console.log(`- Emergency ID: ${responseData.data.id}`);
      console.log(
        `- Location: ${responseData.data.latitude}, ${responseData.data.longitude}`
      );
      console.log(`- Status: ${responseData.data.status}`);
      console.log(`- Timestamp: ${responseData.data.timestamp}`);
    } else {
      const errorText = await response.text();
      console.error("❌ FAILED! Emergency ping failed:");
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${errorText}`);
    }
  } catch (error) {
    console.error("💥 ERROR! Failed to connect to backend:");
    console.error(error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error(
      "1. Make sure the backend server is running: cd backend && npm start"
    );
    console.error("2. Check if the backend is listening on port 3000");
    console.error("3. Verify network connectivity");
  }
}

// Test backend connectivity first
async function testBackendConnectivity() {
  console.log("🔍 Testing backend connectivity...");

  try {
    const response = await fetch(`${BACKEND_URL}/api/emergency/pings`, {
      method: "GET",
    });

    if (response.ok) {
      console.log("✅ Backend is responding!");
      return true;
    } else {
      console.log(`⚠️ Backend responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Cannot connect to backend:", error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log("🚀 Emergency Ping Test Suite");
  console.log("=".repeat(40));

  const isBackendUp = await testBackendConnectivity();

  if (isBackendUp) {
    console.log("");
    await testEmergencyPing();
  } else {
    console.log(
      "\n❌ Cannot proceed with emergency ping test - backend is not responding"
    );
    console.log("\nTo start the backend:");
    console.log("cd c:\\projects\\crime-patrol\\backend");
    console.log("npm start");
  }

  console.log("\n" + "=".repeat(40));
  console.log("✅ Test completed!");
}

runTests();
