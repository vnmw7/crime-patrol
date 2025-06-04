// Normalized Database Setup Script for Crime Patrol
// This script creates multiple collections to normalize the database structure
// Each collection has a maximum of 9 attributes for better organization

import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env" });

// Configuration constants
const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

// Collection IDs and Names - Normalized Structure
const COLLECTIONS = {
  REPORTS: {
    id: process.env.APPWRITE_REPORTS_COLLECTION_ID || "reports_main",
    name: "Reports",
  },
  REPORT_LOCATIONS: {
    id:
      process.env.APPWRITE_REPORT_LOCATIONS_COLLECTION_ID || "report_locations",
    name: "Report Locations",
  },
  REPORT_REPORTER_INFO: {
    id:
      process.env.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID ||
      "report_reporter_info",
    name: "Report Reporter Info",
  },
  REPORT_VICTIMS: {
    id: process.env.APPWRITE_REPORT_VICTIMS_COLLECTION_ID || "report_victims",
    name: "Report Victims",
  },
  REPORT_SUSPECTS: {
    id: process.env.APPWRITE_REPORT_SUSPECTS_COLLECTION_ID || "report_suspects",
    name: "Report Suspects",
  },
  REPORT_WITNESSES: {
    id:
      process.env.APPWRITE_REPORT_WITNESSES_COLLECTION_ID || "report_witnesses",
    name: "Report Witnesses",
  },
  REPORT_MEDIA: {
    id: process.env.APPWRITE_REPORT_MEDIA_COLLECTION_ID || "report_media",
    name: "Report Media",
  },
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Helper function to recreate a collection
async function recreateCollection(
  databaseId,
  collectionId,
  collectionName,
  permissions = null
) {
  console.log(
    `\n--- Setting up collection: ${collectionName} (ID: ${collectionId}) ---`
  );

  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(
      `Existing collection '${collectionName}' found. Deleting to start fresh...`
    );
    await databases.deleteCollection(databaseId, collectionId);
    console.log(`Collection '${collectionName}' deleted successfully.`);
  } catch (error) {
    if (error.code === 404 || error.type === "collection_not_found") {
      console.log(
        `No existing collection '${collectionName}' found. Proceeding with creation.`
      );
    } else {
      console.error(
        `Error checking/deleting existing collection '${collectionName}': ${error.message}`
      );
      throw error;
    }
  }

  console.log(`Creating new collection: ${collectionName}`);
  const collection = await databases.createCollection(
    databaseId,
    collectionId,
    collectionName,
    permissions
  );
  console.log(
    `Collection "${collection.name}" created successfully with ID: ${collection.$id}`
  );
  return collection;
}

// Setup all normalized collections
async function setupNormalizedCollections() {
  try {
    console.log("🚀 Starting normalized database setup...");
    console.log(`Database ID: ${DATABASE_ID}`);

    // Validate required environment variables
    if (!APPWRITE_PROJECT_ID) {
      throw new Error("APPWRITE_PROJECT_ID environment variable is required");
    }
    if (!APPWRITE_API_KEY) {
      throw new Error("APPWRITE_API_KEY environment variable is required");
    }
    if (!DATABASE_ID) {
      throw new Error("APPWRITE_DATABASE_ID environment variable is required");
    }

    // Default permissions for main reports collection
    const defaultPermissions = [
      Permission.create(Role.users()), // Any authenticated user can create
      Permission.read(Role.user("$userId")), // Creator can read (dynamic user ID)
      Permission.update(Role.user("$userId")), // Creator can update
      Permission.delete(Role.user("$userId")), // Creator can delete
      // Add admin permissions if you have an admin role
      // Permission.read(Role.team("admins")),
      // Permission.update(Role.team("admins")),
    ];

    // Permissions for related data collections
    const relatedDataPermissions = [
      Permission.create(Role.users()),
      Permission.read(Role.user("$userId")),
      Permission.update(Role.user("$userId")),
      Permission.delete(Role.user("$userId")),
    ];

    // 1. Reports Collection (Core Incident Info) - 9 attributes
    console.log("\n📋 Setting up Reports Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      COLLECTIONS.REPORTS.name,
      defaultPermissions
    );

    // Create attributes for Reports Collection
    console.log("Creating attributes for Reports Collection...");
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Incident_Type",
      255,
      true
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Incident_Date",
      true
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Incident_Time",
      true
    );
    await databases.createBooleanAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Is_In_Progress",
      true,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Description",
      10000,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "reported_by",
      255,
      true
    );
    await databases.createEnumAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Status",
      ["pending", "approved", "rejected", "responded", "solved"],
      true,
      "pending"
    );
    await databases.createBooleanAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Is_Victim_Reporter",
      true,
      false
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "Created_At",
      false,
      new Date().toISOString()
    );

    console.log("✅ Reports Collection attributes created.");

    // Create indexes for Reports Collection
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "idx_incident_type",
      "key",
      ["Incident_Type"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "idx_status",
      "key",
      ["Status"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "idx_reported_by",
      "key",
      ["reported_by"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORTS.id,
      "idx_incident_date",
      "key",
      ["Incident_Date"]
    );
    console.log("✅ Reports Collection indexes created.");

    // 2. Report Locations Collection (1-to-1 with Reports) - 7 attributes
    console.log("\n📍 Setting up Report Locations Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      COLLECTIONS.REPORT_LOCATIONS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Address",
      500,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Type",
      100,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Details",
      2000,
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Latitude",
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Longitude",
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "Accuracy",
      false
    );

    console.log("✅ Report Locations Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_LOCATIONS.id,
      "idx_coordinates",
      "key",
      ["Latitude", "Longitude"]
    );
    console.log("✅ Report Locations Collection indexes created.");

    // 3. Report Reporter Info Collection (1-to-1 with Reports) - 4 attributes
    console.log("\n👤 Setting up Report Reporter Info Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      COLLECTIONS.REPORT_REPORTER_INFO.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Name",
      255,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Phone",
      50,
      false
    );
    await databases.createEmailAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Email",
      false
    );

    console.log("✅ Report Reporter Info Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_REPORTER_INFO.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Reporter Info Collection indexes created.");

    // 4. Report Victims Collection (1-to-Many with Reports) - 3 attributes
    console.log("\n👥 Setting up Report Victims Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_VICTIMS.id,
      COLLECTIONS.REPORT_VICTIMS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_VICTIMS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_VICTIMS.id,
      "Victim_Name",
      255,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_VICTIMS.id,
      "Victim_Contact",
      255,
      false
    );

    console.log("✅ Report Victims Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_VICTIMS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Victims Collection indexes created.");

    // 5. Report Suspects Collection (1-to-Many with Reports) - 3 attributes
    console.log("\n🕵️ Setting up Report Suspects Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_SUSPECTS.id,
      COLLECTIONS.REPORT_SUSPECTS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_SUSPECTS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_SUSPECTS.id,
      "Suspect_Description",
      5000,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_SUSPECTS.id,
      "Suspect_Vehicle",
      500,
      false
    );

    console.log("✅ Report Suspects Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_SUSPECTS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Suspects Collection indexes created.");

    // 6. Report Witnesses Collection (1-to-Many with Reports) - 2 attributes
    console.log("\n👁️ Setting up Report Witnesses Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_WITNESSES.id,
      COLLECTIONS.REPORT_WITNESSES.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_WITNESSES.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_WITNESSES.id,
      "Witness_Info",
      5000,
      false
    );

    console.log("✅ Report Witnesses Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_WITNESSES.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Witnesses Collection indexes created.");

    // 7. Report Media Collection (1-to-Many with Reports) - 6 attributes
    console.log("\n📷 Setting up Report Media Collection...");
    await recreateCollection(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      COLLECTIONS.REPORT_MEDIA.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "File_ID",
      255,
      true
    );
    await databases.createEnumAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "Media_Type",
      ["photo", "audio", "video"],
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "File_Name_Original",
      255,
      false
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "File_Size",
      false
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "Display_Order",
      false,
      0
    );

    console.log("✅ Report Media Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "idx_media_type",
      "key",
      ["Media_Type"]
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.REPORT_MEDIA.id,
      "idx_display_order",
      "key",
      ["Display_Order"]
    );
    console.log("✅ Report Media Collection indexes created.");

    console.log(
      "\n🎉 All normalized collections and attributes set up successfully!"
    );
    console.log("\n📊 Summary of Collections Created:");
    console.log(
      `1. ${COLLECTIONS.REPORTS.name} (${COLLECTIONS.REPORTS.id}) - 9 attributes`
    );
    console.log(
      `2. ${COLLECTIONS.REPORT_LOCATIONS.name} (${COLLECTIONS.REPORT_LOCATIONS.id}) - 7 attributes`
    );
    console.log(
      `3. ${COLLECTIONS.REPORT_REPORTER_INFO.name} (${COLLECTIONS.REPORT_REPORTER_INFO.id}) - 4 attributes`
    );
    console.log(
      `4. ${COLLECTIONS.REPORT_VICTIMS.name} (${COLLECTIONS.REPORT_VICTIMS.id}) - 3 attributes`
    );
    console.log(
      `5. ${COLLECTIONS.REPORT_SUSPECTS.name} (${COLLECTIONS.REPORT_SUSPECTS.id}) - 3 attributes`
    );
    console.log(
      `6. ${COLLECTIONS.REPORT_WITNESSES.name} (${COLLECTIONS.REPORT_WITNESSES.id}) - 2 attributes`
    );
    console.log(
      `7. ${COLLECTIONS.REPORT_MEDIA.name} (${COLLECTIONS.REPORT_MEDIA.id}) - 6 attributes`
    );
  } catch (error) {
    console.error("\n❌ Error during normalized database setup:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Message:", error.response.data?.message);
      console.error("Type:", error.response.data?.type);
      console.error("Code:", error.response.data?.code);
    } else {
      console.error("Error message:", error.message || error);
    }
    console.error("Full error object:", error);
    throw error;
  }
}

// Export the setup function and collection constants
export { setupNormalizedCollections, COLLECTIONS };

// Main execution
async function main() {
  console.log("🏗️  Starting Crime Patrol Normalized Database Setup...");
  await setupNormalizedCollections();
  console.log("✅ Normalized database setup completed successfully!");
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Failed to run normalized database setup script:", error);
    process.exit(1);
  });
}
