require("dotenv").config();
const { setupAppwriteBuckets } = require("./src/services/appwriteService.js");

async function testBucketSetup() {
  console.log("Testing bucket setup...");
  try {
    await setupAppwriteBuckets();
    console.log("✅ Bucket setup completed successfully");
  } catch (error) {
    console.log("❌ Bucket setup failed:", error.message);
  }
}

testBucketSetup();
