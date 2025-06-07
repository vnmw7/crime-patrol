// Simple test for bucket creation functionality
require("dotenv").config();

async function testBucketSetup() {
  try {
    console.log("🧪 Testing bucket setup functionality...");

    // Import the service
    const appwriteService = require("./src/services/appwriteService");

    // Test the setup function
    console.log("📦 Calling setupAppwriteBuckets...");
    await appwriteService.setupAppwriteBuckets();

    console.log("✅ Bucket setup test completed successfully!");
  } catch (error) {
    console.error("❌ Bucket setup test failed:", error.message);
  }
}

// Run the test
testBucketSetup();
