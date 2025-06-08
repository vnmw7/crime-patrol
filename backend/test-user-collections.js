require("dotenv").config();
const { setupUserCollections } = require("./src/services/userServices");

async function testUserCollectionsSetup() {
  console.log("Testing user collections setup...");

  try {
    await setupUserCollections();
    console.log("✅ User collections setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up user collections:", error);
    process.exit(1);
  }
}

testUserCollectionsSetup();
