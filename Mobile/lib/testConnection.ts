// Simple test script to verify Appwrite client connection from mobile app
import {
  client as appwriteClient,
  getCurrentUser,
  APPWRITE_CRIME_PATROL_BUCKET_ID,
} from "../lib/appwrite";
import { Storage } from "appwrite";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const testAppwriteConnection = async () => {
  console.log("=== Testing Appwrite Connection ===");

  try {
    // Test 1: Check client configuration
    console.log("1. Appwrite Client Configuration:");
    console.log("   Endpoint:", appwriteClient.config.endpoint);
    console.log("   Project ID:", appwriteClient.config.project);
    console.log("   Bucket ID:", APPWRITE_CRIME_PATROL_BUCKET_ID);

    // Test 2: Test user authentication (optional)
    console.log("2. Testing user authentication...");
    try {
      const user = await getCurrentUser();
      console.log(
        "   User authenticated:",
        user ? user.email || user.$id : "No user",
      );
    } catch (authError: any) {
      console.log("   No authenticated user (this is okay for guest uploads)");
    }

    // Test 3: Test storage service connection
    console.log("3. Testing storage service...");
    const storage = new Storage(appwriteClient);

    // Try to list files in the bucket (this should work if permissions are correct)
    try {
      const filesList = await storage.listFiles(
        APPWRITE_CRIME_PATROL_BUCKET_ID,
        // [], // Removed queries for now to simplify
        // 1,  // Removed limit to get full count in .total
      );
      console.log("   ✅ Storage service accessible");
      console.log("   Files in bucket:", filesList.total);
    } catch (storageError: any) {
      console.log("   ❌ Storage service error:", storageError.message);
      console.log("   Error code:", storageError.code);
      console.log("   Error type:", storageError.type);
      throw storageError;
    }

    console.log("=== Connection Test Completed Successfully ===");
    return { success: true, message: "All tests passed" };
  } catch (error: any) {
    console.error("=== Connection Test Failed ===");
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};
