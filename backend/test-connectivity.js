// Comprehensive Appwrite connectivity test
require("dotenv").config();
const { Client, Databases, Storage } = require("node-appwrite");

// Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

console.log("🔧 Appwrite Connectivity Test");
console.log("============================");
console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`Project ID: ${APPWRITE_PROJECT_ID}`);
console.log(
  `API Key: ${
    APPWRITE_API_KEY ? APPWRITE_API_KEY.substring(0, 20) + "..." : "NOT SET"
  }`
);
console.log("");

// Test basic connectivity
async function testBasicConnectivity() {
  console.log("1. Testing basic HTTP connectivity...");

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(APPWRITE_ENDPOINT + "/health", {
      timeout: 10000,
      headers: {
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Basic connectivity successful");
      console.log("   Server status:", data.status);
      return true;
    } else {
      console.log("❌ Basic connectivity failed");
      console.log("   Status:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log("❌ Basic connectivity failed");
    console.log("   Error:", error.message);
    console.log("   Error type:", error.constructor.name);
    return false;
  }
}

// Test Appwrite client initialization
async function testClientInitialization() {
  console.log("2. Testing Appwrite client initialization...");

  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    console.log("✅ Client initialized successfully");
    return client;
  } catch (error) {
    console.log("❌ Client initialization failed");
    console.log("   Error:", error.message);
    return null;
  }
}

// Test database service
async function testDatabaseService(client) {
  console.log("3. Testing database service...");

  try {
    const databases = new Databases(client);

    // Try to list databases with a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Operation timed out after 15 seconds")),
        15000
      )
    );

    const listPromise = databases.list();

    const result = await Promise.race([listPromise, timeoutPromise]);

    console.log("✅ Database service accessible");
    console.log(`   Found ${result.databases.length} databases`);
    return true;
  } catch (error) {
    console.log("❌ Database service failed");
    console.log("   Error:", error.message);
    console.log("   Error code:", error.code);
    console.log("   Error type:", error.type);
    return false;
  }
}

// Test storage service
async function testStorageService(client) {
  console.log("4. Testing storage service...");

  try {
    const storage = new Storage(client);

    // Try to list buckets with a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Operation timed out after 15 seconds")),
        15000
      )
    );

    const listPromise = storage.listBuckets();

    const result = await Promise.race([listPromise, timeoutPromise]);

    console.log("✅ Storage service accessible");
    console.log(`   Found ${result.buckets.length} buckets`);
    return true;
  } catch (error) {
    console.log("❌ Storage service failed");
    console.log("   Error:", error.message);
    console.log("   Error code:", error.code);
    console.log("   Error type:", error.type);
    return false;
  }
}

// Test with different timeout settings
async function testWithDifferentTimeouts(client) {
  console.log("5. Testing with different timeout settings...");

  const timeouts = [5000, 10000, 20000, 30000];

  for (const timeout of timeouts) {
    console.log(`   Testing with ${timeout}ms timeout...`);

    try {
      const databases = new Databases(client);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeout}ms`)),
          timeout
        )
      );

      const listPromise = databases.list();

      await Promise.race([listPromise, timeoutPromise]);

      console.log(`   ✅ Success with ${timeout}ms timeout`);
      return timeout;
    } catch (error) {
      console.log(`   ❌ Failed with ${timeout}ms timeout: ${error.message}`);
    }
  }

  return null;
}

// DNS resolution test
async function testDNSResolution() {
  console.log("6. Testing DNS resolution...");

  try {
    const dns = require("dns").promises;
    const url = new URL(APPWRITE_ENDPOINT);
    const addresses = await dns.lookup(url.hostname);

    console.log("✅ DNS resolution successful");
    console.log(`   ${url.hostname} resolves to: ${addresses.address}`);
    return true;
  } catch (error) {
    console.log("❌ DNS resolution failed");
    console.log("   Error:", error.message);
    return false;
  }
}

// Network route test
async function testNetworkRoute() {
  console.log("7. Testing network route (ping)...");

  try {
    const { exec } = require("child_process");
    const url = new URL(APPWRITE_ENDPOINT);

    return new Promise((resolve) => {
      exec(`ping -n 4 ${url.hostname}`, (error, stdout, stderr) => {
        if (error) {
          console.log("❌ Ping failed");
          console.log("   Error:", error.message);
          resolve(false);
        } else {
          console.log("✅ Ping successful");
          const lines = stdout
            .split("\n")
            .filter(
              (line) => line.includes("Reply from") || line.includes("Average")
            );
          lines.forEach((line) => console.log("  ", line.trim()));
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log("❌ Ping test failed");
    console.log("   Error:", error.message);
    return false;
  }
}

// Main test function
async function runConnectivityTests() {
  console.log("Starting comprehensive connectivity tests...\n");

  // Check if node-fetch is available
  try {
    await import("node-fetch");
  } catch (error) {
    console.log("Installing node-fetch for connectivity tests...");
    const { exec } = require("child_process");
    await new Promise((resolve, reject) => {
      exec("npm install node-fetch", (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  const results = {};

  // Run all tests
  results.basicConnectivity = await testBasicConnectivity();
  console.log("");

  results.dnsResolution = await testDNSResolution();
  console.log("");

  results.networkRoute = await testNetworkRoute();
  console.log("");

  const client = await testClientInitialization();
  console.log("");

  if (client) {
    results.databaseService = await testDatabaseService(client);
    console.log("");

    results.storageService = await testStorageService(client);
    console.log("");

    results.optimalTimeout = await testWithDifferentTimeouts(client);
    console.log("");
  }

  // Summary
  console.log("📊 Test Results Summary");
  console.log("=====================");
  console.log(`Basic Connectivity: ${results.basicConnectivity ? "✅" : "❌"}`);
  console.log(`DNS Resolution: ${results.dnsResolution ? "✅" : "❌"}`);
  console.log(`Network Route: ${results.networkRoute ? "✅" : "❌"}`);
  console.log(`Database Service: ${results.databaseService ? "✅" : "❌"}`);
  console.log(`Storage Service: ${results.storageService ? "✅" : "❌"}`);
  console.log(
    `Optimal Timeout: ${
      results.optimalTimeout ? results.optimalTimeout + "ms" : "None found"
    }`
  );

  // Recommendations
  console.log("\n💡 Recommendations");
  console.log("=================");

  if (!results.basicConnectivity || !results.dnsResolution) {
    console.log("• Check your internet connection");
    console.log("• Verify firewall settings");
    console.log("• Try using a VPN if corporate firewall is blocking");
  }

  if (!results.networkRoute) {
    console.log("• Network connectivity issues detected");
    console.log("• Consider switching to a different network");
    console.log("• Check if your ISP is blocking the Appwrite endpoints");
  }

  if (results.basicConnectivity && !results.databaseService) {
    console.log("• API key might be invalid or have insufficient permissions");
    console.log("• Check project ID configuration");
    console.log("• Verify API key in Appwrite console");
  }

  if (results.optimalTimeout) {
    console.log(
      `• Use a timeout of at least ${results.optimalTimeout}ms for operations`
    );
    console.log("• Consider implementing retry logic with exponential backoff");
  }

  if (!results.optimalTimeout) {
    console.log(
      "• All timeouts failed - this suggests a persistent connectivity issue"
    );
    console.log("• Try switching to a different Appwrite region if possible");
    console.log(
      "• Contact your network administrator about accessing fra.cloud.appwrite.io"
    );
  }
}

// Run the tests
runConnectivityTests().catch((error) => {
  console.error("Test runner failed:", error);
});
