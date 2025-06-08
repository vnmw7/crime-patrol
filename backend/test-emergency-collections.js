require("dotenv").config();
const {
  setupEmergencyPingsCollection,
} = require("./src/services/emergencyService");

async function testEmergencyPingsSetup() {
  console.log("Testing emergency pings collection setup...");

  try {
    await setupEmergencyPingsCollection();
    console.log("✅ Emergency pings collection setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up emergency pings collection:", error);
    process.exit(1);
  }
}

testEmergencyPingsSetup();
