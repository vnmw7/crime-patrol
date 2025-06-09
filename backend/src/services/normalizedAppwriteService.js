const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  DATABASE_ID,
  NORMALIZED_COLLECTIONS,
} = require("../config/appwriteConfig.js");

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
      NORMALIZED_COLLECTIONS.REPORTS.id,
      NORMALIZED_COLLECTIONS.REPORTS.name,
      defaultPermissions
    );

    // Create attributes for Reports Collection
    console.log("Creating attributes for Reports Collection...");
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Incident_Type",
      255,
      true
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Incident_Date",
      true
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Incident_Time",
      true
    );
    await databases.createBooleanAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Is_In_Progress",
      true,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Description",
      10000,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "reported_by",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Status",
      50,
      true,
      "pending"
    );
    await databases.createBooleanAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Is_Victim_Reporter",
      true,
      false
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "Created_At",
      false,
      new Date().toISOString()
    );

    console.log("✅ Reports Collection attributes created.");

    // Create indexes for Reports Collection
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_incident_type",
      "key",
      ["Incident_Type"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_status",
      "key",
      ["Status"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_reported_by",
      "key",
      ["reported_by"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_incident_date",
      "key",
      ["Incident_Date"]
    );
    console.log("✅ Reports Collection indexes created.");

    // 2. Report Locations Collection (1-to-1 with Reports) - 7 attributes
    console.log("\n📍 Setting up Report Locations Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Address",
      500,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Type",
      100,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Location_Details",
      2000,
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Latitude",
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Longitude",
      false
    );
    await databases.createFloatAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "Accuracy",
      false
    );

    console.log("✅ Report Locations Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "idx_coordinates",
      "key",
      ["Latitude", "Longitude"]
    );
    console.log("✅ Report Locations Collection indexes created.");

    // 3. Report Reporter Info Collection (1-to-1 with Reports) - 4 attributes
    console.log("\n👤 Setting up Report Reporter Info Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Name",
      255,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Phone",
      50,
      false
    );
    await databases.createEmailAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "Reporter_Email",
      false
    );

    console.log("✅ Report Reporter Info Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Reporter Info Collection indexes created.");

    // 4. Report Victims Collection (1-to-Many with Reports) - 3 attributes
    console.log("\n👥 Setting up Report Victims Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "Victim_Name",
      255,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "Victim_Contact",
      255,
      false
    );

    console.log("✅ Report Victims Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Victims Collection indexes created.");

    // 5. Report Suspects Collection (1-to-Many with Reports) - 3 attributes
    console.log("\n🕵️ Setting up Report Suspects Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "Suspect_Description",
      5000,
      false
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "Suspect_Vehicle",
      500,
      false
    );

    console.log("✅ Report Suspects Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Suspects Collection indexes created.");

    // 6. Report Witnesses Collection (1-to-Many with Reports) - 2 attributes
    console.log("\n👁️ Setting up Report Witnesses Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "Witness_Info",
      5000,
      false
    );

    console.log("✅ Report Witnesses Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    console.log("✅ Report Witnesses Collection indexes created.");

    // 7. Report Media Collection (1-to-Many with Reports) - 6 attributes
    console.log("\n📷 Setting up Report Media Collection...");
    await recreateCollection(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.name,
      relatedDataPermissions
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "report_id",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "File_ID",
      255,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "Media_Type",
      50,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "File_Name_Original",
      255,
      false
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "File_Size",
      false
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "Display_Order",
      false,
      0
    );

    console.log("✅ Report Media Collection attributes created.");

    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "idx_report_id",
      "key",
      ["report_id"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "idx_media_type",
      "key",
      ["Media_Type"]
    );
    await databases.createIndex(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
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
      `1. ${NORMALIZED_COLLECTIONS.REPORTS.name} (${NORMALIZED_COLLECTIONS.REPORTS.id}) - 9 attributes`
    );
    console.log(
      `2. ${NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.name} (${NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id}) - 7 attributes`
    );
    console.log(
      `3. ${NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.name} (${NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id}) - 4 attributes`
    );
    console.log(
      `4. ${NORMALIZED_COLLECTIONS.REPORT_VICTIMS.name} (${NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id}) - 3 attributes`
    );
    console.log(
      `5. ${NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.name} (${NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id}) - 3 attributes`
    );
    console.log(
      `6. ${NORMALIZED_COLLECTIONS.REPORT_WITNESSES.name} (${NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id}) - 2 attributes`
    );
    console.log(
      `7. ${NORMALIZED_COLLECTIONS.REPORT_MEDIA.name} (${NORMALIZED_COLLECTIONS.REPORT_MEDIA.id}) - 6 attributes`
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

// CRUD Operations for normalized collections

/**
 * Create a complete report with all related data
 * @param {Object} reportData - Complete report data
 * @returns {Promise<Object>} - Created report with all related data IDs
 */
async function createCompleteReport(reportData) {
  try {
    const {
      // Main report data
      incidentType,
      incidentDate,
      incidentTime,
      isInProgress,
      description,
      reportedBy,
      status = "pending",
      isVictimReporter,

      // Location data
      locationAddress,
      locationType,
      locationDetails,
      latitude,
      longitude,
      accuracy,

      // Reporter info
      reporterName,
      reporterPhone,
      reporterEmail,

      // Victims (array)
      victims = [],

      // Suspects (array)
      suspects = [],

      // Witnesses (array)
      witnesses = [],

      // Media files (array)
      mediaFiles = [],
    } = reportData;

    // 1. Create main report
    const mainReport = await databases.createDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      ID.unique(),
      {
        Incident_Type: incidentType,
        Incident_Date: incidentDate,
        Incident_Time: incidentTime,
        Is_In_Progress: isInProgress,
        Description: description,
        reported_by: reportedBy,
        Status: status,
        Is_Victim_Reporter: isVictimReporter,
        Created_At: new Date().toISOString(),
      }
    );

    const reportId = mainReport.$id;
    const result = { mainReport, relatedData: {} };

    // 2. Create location data if provided
    if (locationAddress || latitude || longitude) {
      const locationData = await databases.createDocument(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
        ID.unique(),
        {
          report_id: reportId,
          Location_Address: locationAddress || "",
          Location_Type: locationType || "",
          Location_Details: locationDetails || "",
          Latitude: latitude || null,
          Longitude: longitude || null,
          Accuracy: accuracy || null,
        }
      );
      result.relatedData.location = locationData;
    }

    // 3. Create reporter info if provided
    if (reporterName || reporterPhone || reporterEmail) {
      const reporterInfo = await databases.createDocument(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
        ID.unique(),
        {
          report_id: reportId,
          Reporter_Name: reporterName || "",
          Reporter_Phone: reporterPhone || "",
          Reporter_Email: reporterEmail || "",
        }
      );
      result.relatedData.reporterInfo = reporterInfo;
    }

    // 4. Create victims
    if (victims.length > 0) {
      result.relatedData.victims = [];
      for (const victim of victims) {
        const victimData = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          ID.unique(),
          {
            report_id: reportId,
            Victim_Name: victim.name || "",
            Victim_Contact: victim.contact || "",
          }
        );
        result.relatedData.victims.push(victimData);
      }
    }

    // 5. Create suspects
    if (suspects.length > 0) {
      result.relatedData.suspects = [];
      for (const suspect of suspects) {
        const suspectData = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          ID.unique(),
          {
            report_id: reportId,
            Suspect_Description: suspect.description || "",
            Suspect_Vehicle: suspect.vehicle || "",
          }
        );
        result.relatedData.suspects.push(suspectData);
      }
    }

    // 6. Create witnesses
    if (witnesses.length > 0) {
      result.relatedData.witnesses = [];
      for (const witness of witnesses) {
        const witnessData = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
          ID.unique(),
          {
            report_id: reportId,
            Witness_Info: witness.info || "",
          }
        );
        result.relatedData.witnesses.push(witnessData);
      }
    }

    // 7. Create media files
    if (mediaFiles.length > 0) {
      result.relatedData.media = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        const media = mediaFiles[i];
        const mediaData = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          ID.unique(),
          {
            report_id: reportId,
            File_ID: media.fileId,
            Media_Type: media.type, // "photo", "audio", "video"
            File_Name_Original: media.originalName || "",
            File_Size: media.size || null,
            Display_Order: i,
          }
        );
        result.relatedData.media.push(mediaData);
      }
    }

    return result;
  } catch (error) {
    console.error("Error creating complete report:", error);
    throw error;
  }
}

/**
 * Get a complete report with all related data
 * @param {string} reportId - The ID of the report to retrieve
 * @returns {Promise<Object>} - Complete report data
 */
async function getCompleteReport(reportId) {
  try {
    // Get main report
    const mainReport = await databases.getDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      reportId
    );

    const result = { mainReport, relatedData: {} };

    // Get location data
    try {
      const locationData = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
        [`report_id=${reportId}`]
      );
      if (locationData.documents.length > 0) {
        result.relatedData.location = locationData.documents[0];
      }
    } catch (error) {
      console.log("No location data found for report:", reportId);
    }

    // Get reporter info
    try {
      const reporterInfo = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
        [`report_id=${reportId}`]
      );
      if (reporterInfo.documents.length > 0) {
        result.relatedData.reporterInfo = reporterInfo.documents[0];
      }
    } catch (error) {
      console.log("No reporter info found for report:", reportId);
    }

    // Get victims
    try {
      const victims = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
        [`report_id=${reportId}`]
      );
      result.relatedData.victims = victims.documents;
    } catch (error) {
      console.log("No victims found for report:", reportId);
      result.relatedData.victims = [];
    }

    // Get suspects
    try {
      const suspects = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
        [`report_id=${reportId}`]
      );
      result.relatedData.suspects = suspects.documents;
    } catch (error) {
      console.log("No suspects found for report:", reportId);
      result.relatedData.suspects = [];
    }

    // Get witnesses
    try {
      const witnesses = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
        [`report_id=${reportId}`]
      );
      result.relatedData.witnesses = witnesses.documents;
    } catch (error) {
      console.log("No witnesses found for report:", reportId);
      result.relatedData.witnesses = [];
    }

    // Get media files
    try {
      const media = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
        [`report_id=${reportId}`]
      );
      result.relatedData.media = media.documents.sort(
        (a, b) => a.Display_Order - b.Display_Order
      );
    } catch (error) {
      console.log("No media found for report:", reportId);
      result.relatedData.media = [];
    }

    return result;
  } catch (error) {
    console.error("Error getting complete report:", error);
    throw error;
  }
}

/**
 * Update report status
 * @param {string} reportId - The ID of the report to update
 * @param {string} newStatus - New status: "pending", "approved", "rejected", "responded", "solved"
 * @returns {Promise<Object>} - Updated report
 */
async function updateReportStatus(reportId, newStatus) {
  try {
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "responded",
      "solved",
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const updatedReport = await databases.updateDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      reportId,
      { Status: newStatus }
    );

    return updatedReport;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

/**
 * Get reports by status
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} - Reports with the specified status
 */
async function getReportsByStatus(status) {
  try {
    const reports = await databases.listDocuments(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      [`Status=${status}`]
    );

    return reports.documents;
  } catch (error) {
    console.error("Error getting reports by status:", error);
    throw error;
  }
}

/**
 * Get reports by user
 * @param {string} userId - User ID to filter by
 * @returns {Promise<Array>} - Reports created by the specified user
 */
async function getReportsByUser(userId) {
  try {
    const reports = await databases.listDocuments(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      [`reported_by=${userId}`]
    );

    return reports.documents;
  } catch (error) {
    console.error("Error getting reports by user:", error);
    throw error;
  }
}

module.exports = {
  setupNormalizedCollections,
  createCompleteReport,
  getCompleteReport,
  updateReportStatus,
  getReportsByStatus,
  getReportsByUser,
  NORMALIZED_COLLECTIONS,
  databases,
  client,
};
