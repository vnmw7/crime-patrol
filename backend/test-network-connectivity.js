// Test emergency ping network connectivity
// This script tests the same endpoints the mobile app uses

console.log("🧪 Emergency Ping Network Connectivity Test");
console.log("===========================================\n");

const testEmergencyPing = async () => {
  // Test both localhost (for local testing) and 10.0.2.2 (for Android emulator)
  const endpoints = [
    {
      url: "http://localhost:3000/api/emergency/location",
      description: "Local development server",
    },
    {
      url: "http://10.0.2.2:3000/api/emergency/location",
      description: "Android emulator access to host",
    },
  ];

  const testPayload = {
    latitude: 14.5995, // Manila coordinates for testing
    longitude: 120.9842,
    timestamp: new Date().toISOString(),
    userId: "test-connectivity-user",
    emergencyContact: "+639485685828",
    accuracy: 10,
    altitude: 50,
    heading: 180,
    speed: 0,
    testMode: true,
  };

  console.log("Test payload:", JSON.stringify(testPayload, null, 2));
  console.log("");

  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint.description}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
        timeout: 10000, // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log("   ✅ SUCCESS - Server responded correctly");
        console.log("   📄 Response:", JSON.stringify(data, null, 6));
      } else {
        const errorText = await response.text();
        console.log(
          `   ❌ HTTP ERROR ${response.status} (${response.statusText})`
        );
        console.log("   📄 Response:", errorText);
      }
    } catch (error) {
      console.log("   ❌ NETWORK ERROR:", error.message);

      if (error.message.includes("ECONNREFUSED")) {
        console.log(
          "   💡 Suggestion: Make sure the backend server is running"
        );
        console.log("      Run: npm start in the backend directory");
      } else if (error.message.includes("timeout")) {
        console.log("   💡 Suggestion: Server may be slow to respond");
      } else if (error.message.includes("fetch is not defined")) {
        console.log(
          "   💡 Suggestion: This Node.js version needs node-fetch package"
        );
      }
    }

    console.log(""); // Empty line for readability
  }

  console.log("🔍 Network Diagnostics:");
  console.log("─".repeat(50));
  console.log(
    "• localhost:3000 - Direct connection to your development server"
  );
  console.log("• 10.0.2.2:3000 - Android emulator route to host machine");
  console.log(
    "• If using physical Android device, use your computer's IP address"
  );
  console.log("");
  console.log("📱 Mobile App Configuration:");
  console.log(
    "• Android Emulator: http://10.0.2.2:3000/api/emergency/location"
  );
  console.log("• iOS Simulator: http://localhost:3000/api/emergency/location");
  console.log(
    "• Physical Device: http://[YOUR_IP]:3000/api/emergency/location"
  );
};

// Install node-fetch if needed (for older Node.js versions)
async function ensureFetch() {
  if (typeof fetch === "undefined") {
    try {
      const fetch = (await import("node-fetch")).default;
      global.fetch = fetch;
    } catch (error) {
      console.log("❌ fetch is not available and node-fetch is not installed");
      console.log("💡 Run: npm install node-fetch");
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  await ensureFetch();
  await testEmergencyPing();

  console.log("✅ Test completed!");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Start the backend server: npm start");
  console.log("2. Test the mobile app emergency button");
  console.log("3. Check the server logs for incoming requests");
}

main().catch(console.error);
