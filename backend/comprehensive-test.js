require("dotenv").config();
const {
  setupUserCollections,
  createCompleteUser,
  getUsers,
} = require("./src/services/userServices");
const {
  setupEmergencyPingsCollection,
  createEmergencyPing,
} = require("./src/services/emergencyService");

async function runComprehensiveTest() {
  console.log(
    "🚀 Starting comprehensive test of user collections and emergency pings...\n"
  );

  try {
    // Test 1: Setup User Collections
    console.log("📋 Test 1: Setting up user collections...");
    await setupUserCollections();
    console.log("✅ User collections setup completed successfully!\n");

    // Test 2: Setup Emergency Pings Collection
    console.log("🚨 Test 2: Setting up emergency pings collection...");
    await setupEmergencyPingsCollection();
    console.log(
      "✅ Emergency pings collection setup completed successfully!\n"
    );

    // Test 3: Create a test user
    console.log("👤 Test 3: Creating a test user...");
    const testUser = await createCompleteUser({
      firstName: "John",
      lastName: "Doe",
      role: "citizen",
      isVerified: false,
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, City, State",
      idPictureUrl: "https://example.com/id-picture.jpg",
      documentType: "driver_license",
      documentVerified: false,
    });
    console.log("✅ Test user created successfully!");
    console.log(`   User ID: ${testUser.user.$id}`);
    console.log(`   Contact ID: ${testUser.contact?.$id || "None"}`);
    console.log(`   Document ID: ${testUser.document?.$id || "None"}\n`);

    // Test 4: Create a test emergency ping
    console.log("📍 Test 4: Creating a test emergency ping...");
    const testPing = await createEmergencyPing({
      latitude: 40.7128,
      longitude: -74.006,
      userId: testUser.user.$id,
      status: "pending",
    });
    console.log("✅ Test emergency ping created successfully!");
    console.log(`   Ping ID: ${testPing.$id}\n`);

    // Test 5: Retrieve users
    console.log("📋 Test 5: Retrieving users...");
    const users = await getUsers({
      limit: 10,
      includeContacts: true,
      includeDocuments: true,
    });
    console.log(`✅ Retrieved ${users.length} users successfully!\n`);

    console.log(
      "🎉 ALL TESTS PASSED! User collections and emergency pings are working correctly!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

runComprehensiveTest();
