// Test script to validate Appwrite connection
import { Client, Databases, Storage } from "appwrite";
import Constants from "expo-constants";

// Get configuration from app.config.js
const APPWRITE_PROJECT_ID =
  Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID || "";
const APPWRITE_ENDPOINT =
  Constants.expoConfig?.extra?.APPWRITE_ENDPOINT ||
  "https://fra.cloud.appwrite.io/v1";
const APPWRITE_DATABASE_ID =
  Constants.expoConfig?.extra?.APPWRITE_DATABASE_ID || "";
const APPWRITE_BUCKET_ID =
  Constants.expoConfig?.extra?.APPWRITE_BUCKET_ID || "";

console.log("=== Testing Appwrite Connection ===");
console.log("Endpoint:", APPWRITE_ENDPOINT);
console.log("Project ID:", APPWRITE_PROJECT_ID);
console.log("Database ID:", APPWRITE_DATABASE_ID);
console.log("Bucket ID:", APPWRITE_BUCKET_ID);

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);

export async function testConnection() {
  try {
    console.log("\n--- Testing basic connection ---");

    // Test 1: Try to list databases (should work even without auth)
    console.log("Testing databases connection...");
    const databasesList = await databases.list();
    console.log("✅ Databases connection successful");

    // Test 2: Try to get bucket info
    console.log("Testing storage connection...");
    if (APPWRITE_BUCKET_ID) {
      try {
        const bucket = await storage.getBucket(APPWRITE_BUCKET_ID);
        console.log("✅ Storage bucket found:", bucket.name);
      } catch (bucketError) {
        console.log("❌ Storage bucket error:", bucketError.message);
        if (bucketError.code === 404) {
          console.log(
            "   Bucket not found - check APPWRITE_BUCKET_ID configuration",
          );
        }
      }
    } else {
      console.log("❌ APPWRITE_BUCKET_ID not configured");
    }

    console.log("\n✅ Basic Appwrite connection test completed");
    return true;
  } catch (error) {
    console.log("\n❌ Connection test failed:");
    console.log("Error:", error.message);

    if (error.message.includes("Network request failed")) {
      console.log("\nPossible causes:");
      console.log("- No internet connection");
      console.log("- Firewall blocking the request");
      console.log("- Incorrect endpoint URL");
      console.log("- Appwrite server is down");
    } else if (error.code === 401) {
      console.log(
        "\nAuthentication error - this might be expected for some operations",
      );
    } else if (error.code === 404) {
      console.log("\nProject not found - check APPWRITE_PROJECT_ID");
    }

    return false;
  }
}

// Export for use in debugging
export { client, databases, storage };
