const {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} = require("node-appwrite");
const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  DATABASE_ID,
  NORMALIZED_COLLECTIONS,
  STORAGE_BUCKETS,
} = require("../config/appwriteConfig.js");

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Helper function to add delay between operations
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to retry operations with exponential backoff
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Check if it's a timeout or server error that we should retry
      if (
        error.code === 503 ||
        error.code === 504 ||
        error.code === 500 ||
        error.message.includes("timeout") ||
        error.message.includes("503")
      ) {
        const delayTime = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      } else {
        // Don't retry for other types of errors
        throw error;
      }
    }
  }
}

// Helper function to create attribute only if it doesn't exist
async function createAttributeIfNotExists(
  databaseId,
  collectionId,
  attributeName,
  createAttributeFunction
) {
  try {
    // First check if attribute already exists
    const exists = await attributeExists(
      databaseId,
      collectionId,
      attributeName
    );
    if (exists) {
      console.log(
        `✅ Attribute '${attributeName}' already exists in collection ${collectionId}. Skipping creation.`
      );
      return;
    }

    await retryWithBackoff(async () => {
      await createAttributeFunction();
    });
    console.log(
      `✨ Attribute '${attributeName}' created successfully in collection ${collectionId}.`
    );
    // Add small delay between attribute creations to avoid overwhelming the server
    await delay(500);
  } catch (error) {
    if (error.code === 409) {
      console.log(
        `✅ Attribute '${attributeName}' already exists in collection ${collectionId}.`
      );
    } else {
      console.error(
        `❌ Error creating attribute '${attributeName}' in database ${databaseId}, collection ${collectionId}:`
      );
      console.error(`Status: ${error.code}`);
      console.error(`Message: ${error.message}`);
      console.error(`Type: ${error.type}`);
      console.error(`Code: ${error.code}`);
      throw error;
    }
  }
}

// Helper function to create index only if it doesn't exist
async function createIndexIfNotExists(
  databaseId,
  collectionId,
  indexName,
  createIndexFunction
) {
  try {
    // First check if index already exists
    const exists = await indexExists(databaseId, collectionId, indexName);
    if (exists) {
      console.log(
        `✅ Index '${indexName}' already exists in collection ${collectionId}. Skipping creation.`
      );
      return;
    }

    await retryWithBackoff(async () => {
      await createIndexFunction();
    });
    console.log(
      `✨ Index '${indexName}' created successfully in collection ${collectionId}.`
    );
    // Add small delay between index creations
    await delay(500);
  } catch (error) {
    if (error.code === 409) {
      console.log(
        `✅ Index '${indexName}' already exists in collection ${collectionId}.`
      );
    } else {
      console.error(
        `❌ Error creating index '${indexName}' in database ${databaseId}, collection ${collectionId}:`
      );
      console.error(`Status: ${error.code}`);
      console.error(`Message: ${error.message}`);
      throw error;
    }
  }
}

// Helper function to check if collection has all required attributes
async function hasAllRequiredAttributes(
  databaseId,
  collectionId,
  requiredAttributes
) {
  try {
    const collection = await retryWithBackoff(async () => {
      return await databases.getCollection(databaseId, collectionId);
    });
    const existingAttributes = collection.attributes.map((attr) => attr.key);

    const missingAttributes = requiredAttributes.filter(
      (attr) => !existingAttributes.includes(attr)
    );
    return missingAttributes.length === 0;
  } catch (error) {
    return false;
  }
}

// Helper function to create a collection only if it doesn't exist, or recreate if incomplete
async function createCollectionIfNotExists(
  databaseId,
  collectionId,
  collectionName,
  requiredAttributes = []
) {
  console.log(
    `\n--- Checking collection: ${collectionName} (ID: ${collectionId}) ---`
  );
  try {
    const existingCollection = await databases.getCollection(
      databaseId,
      collectionId
    );

    // Check if collection has all required attributes
    if (requiredAttributes.length > 0) {
      const hasAllAttributes = await hasAllRequiredAttributes(
        databaseId,
        collectionId,
        requiredAttributes
      );
      if (hasAllAttributes) {
        console.log(
          `✅ Collection '${collectionName}' already exists with all required attributes. Skipping setup.`
        );
        return existingCollection;
      } else {
        console.log(
          `⚠️  Collection '${collectionName}' exists but missing attributes. Will skip recreating and only add missing attributes.`
        );
        return existingCollection;
      }
    } else {
      console.log(
        `✅ Collection '${collectionName}' already exists. Skipping creation.`
      );
      return existingCollection;
    }
  } catch (error) {
    if (error.code === 404 || error.type === "collection_not_found") {
      console.log(
        `📋 Collection '${collectionName}' not found. Creating new collection...`
      );
    } else {
      console.error(
        `Error checking collection '${collectionName}': ${error.message}`
      );
      throw error;
    }
  }
  console.log(`Creating new collection: ${collectionName}`);

  const collectionPermissions = [
    Permission.create(Role.any()),
    Permission.read(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ];

  const collection = await retryWithBackoff(async () => {
    return await databases.createCollection(
      databaseId,
      collectionId,
      collectionName,
      collectionPermissions
    );
  });
  console.log(
    `Collection "${collection.name}" created successfully with ID: ${collection.$id}`
  );
  // Add delay after collection creation
  await delay(1000);
  return collection;
}

// Helper function to recreate a collection (legacy function - kept for backward compatibility)
async function recreateCollection(databaseId, collectionId, collectionName) {
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
    collectionName
  );
  console.log(
    `Collection "${collection.name}" created successfully with ID: ${collection.$id}`
  );
  return collection;
}

// Helper function to check if an attribute exists in a collection
async function attributeExists(databaseId, collectionId, attributeName) {
  try {
    const collection = await databases.getCollection(databaseId, collectionId);
    const existingAttributes = collection.attributes.map((attr) => attr.key);
    return existingAttributes.includes(attributeName);
  } catch (error) {
    return false;
  }
}

// Helper function to check if an index exists in a collection
async function indexExists(databaseId, collectionId, indexName) {
  try {
    const collection = await databases.getCollection(databaseId, collectionId);
    const existingIndexes = collection.indexes.map((index) => index.key);
    return existingIndexes.includes(indexName);
  } catch (error) {
    return false;
  }
}

// Helper function to check if collection setup is complete
async function isCollectionSetupComplete(
  databaseId,
  collectionId,
  requiredAttributes = [],
  requiredIndexes = []
) {
  try {
    const collection = await databases.getCollection(databaseId, collectionId);

    // Check attributes
    const existingAttributes = collection.attributes.map((attr) => attr.key);
    const missingAttributes = requiredAttributes.filter(
      (attr) => !existingAttributes.includes(attr)
    );

    // Check indexes
    const existingIndexes = collection.indexes.map((index) => index.key);
    const missingIndexes = requiredIndexes.filter(
      (index) => !existingIndexes.includes(index)
    );

    const isComplete =
      missingAttributes.length === 0 && missingIndexes.length === 0;

    if (!isComplete) {
      if (missingAttributes.length > 0) {
        console.log(`   Missing attributes: ${missingAttributes.join(", ")}`);
      }
      if (missingIndexes.length > 0) {
        console.log(`   Missing indexes: ${missingIndexes.join(", ")}`);
      }
    }

    return isComplete;
  } catch (error) {
    return false;
  }
}

// Helper function to create bucket only if it doesn't exist
async function createBucketIfNotExists(
  bucketId,
  bucketName,
  permissions = null
) {
  try {
    // First, try to get the bucket to check if it exists
    console.log(`🔍 Checking if bucket '${bucketName}' exists...`);
    const existingBucket = await retryWithBackoff(async () => {
      return await storage.getBucket(bucketId);
    });

    console.log(
      `✅ Bucket '${bucketName}' already exists with ID: ${existingBucket.$id}`
    );
    return existingBucket;
  } catch (error) {
    // If bucket doesn't exist (404 error), create it
    if (error.code === 404 || error.type === "storage_bucket_not_found") {
      try {
        console.log(`📁 Creating bucket '${bucketName}'...`);
        const bucket = await retryWithBackoff(async () => {
          return await storage.createBucket(bucketId, bucketName, permissions);
        });
        console.log(
          `✨ Bucket '${bucketName}' created successfully with ID: ${bucket.$id}`
        );
        // Add delay after bucket creation
        await delay(1000);
        return bucket;
      } catch (createError) {
        console.error(
          `Error creating bucket '${bucketName}': ${createError.message}`
        );
        throw createError;
      }
    } else {
      // Some other error occurred while checking bucket existence
      console.error(`Error checking bucket '${bucketName}': ${error.message}`);
      throw error;
    }
  }
}

// Setup Appwrite storage buckets for report media
async function setupAppwriteBuckets() {
  try {
    console.log("=== Setting up Appwrite Storage Bucket ===");
    console.log(
      "Creating single bucket for all media types (images, videos, audios)..."
    );

    // Default permissions for buckets
    const bucketPermissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];

    // Create the single Crime Patrol bucket
    console.log("\n🔄 Setting up Crime Patrol Bucket...");
    await createBucketIfNotExists(
      STORAGE_BUCKETS.CRIME_PATROL.id,
      STORAGE_BUCKETS.CRIME_PATROL.name,
      bucketPermissions
    );

    console.log("\n🎉 === Storage bucket setup completed successfully! === 🎉");
    console.log("✅ Bucket created with retry logic:");
    console.log(
      `   📁 ${STORAGE_BUCKETS.CRIME_PATROL.name} (${STORAGE_BUCKETS.CRIME_PATROL.id}) - For all media files (images, videos, audios)`
    );
    console.log(
      "\n🔄 Single bucket setup completed - optimized for free plan limitations"
    );
  } catch (error) {
    console.error("\n❌ Error setting up storage buckets:");

    // Check for permission errors specifically
    if (
      error.code === 401 ||
      error.type === "general_unauthorized_scope" ||
      error.message.includes("missing scope")
    ) {
      console.error("🔑 API Key Permission Issue:");
      console.error(
        "   Your Appwrite API key doesn't have storage bucket permissions."
      );
      console.error("   To fix this:");
      console.error("   1. Go to your Appwrite Console");
      console.error("   2. Navigate to Settings > API Keys");
      console.error("   3. Edit your API key");
      console.error("   4. Add these scopes:");
      console.error("      - buckets.read");
      console.error("      - buckets.write");
      console.error("      - files.read");
      console.error("      - files.write");
      console.error("   5. Save the changes");
      console.error(
        "\n   ⚠️  Storage buckets will be unavailable until permissions are updated."
      );
      console.error("   📋 Database collections will work normally.");
      return; // Don't throw error, just warn and continue
    }

    // Better error handling for timeout issues
    if (
      error.code === 503 ||
      error.message.includes("timeout") ||
      error.message.includes("503")
    ) {
      console.error(
        "🔄 This appears to be a timeout error. The Appwrite server may be slow or overloaded."
      );
      console.error("💡 Suggestions:");
      console.error("   - Wait a few minutes and restart the server");
      console.error("   - Check your internet connection");
      console.error("   - Verify Appwrite server status");
      console.error(
        "   - The retry logic should help, but server may need more time"
      );
    }

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Message:", error.response.data?.message);
      console.error("Type:", error.response.data?.type);
      console.error("Code:", error.response.data?.code);
    } else {
      console.error("Error message:", error.message || error);
      console.error("Error code:", error.code);
      if (error.code === 503) {
        console.error("Response body:", error.response);
      }
    }
    throw error; // Re-throw the error
  }
}

// Setup normalized collections for crime reports
async function setupNormalizedCollections() {
  try {
    console.log("=== Setting up Normalized Crime Report Collections ===");
    console.log(
      "Note: Adding delays between operations to prevent timeouts..."
    );

    // 1. Reports Collection (Core incident info - 4 attributes)
    console.log("\n🔄 Step 1/7: Setting up Reports Collection...");
    const reportsRequiredAttributes = [
      "incident_type",
      "incident_date",
      "reported_by",
      "status",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      NORMALIZED_COLLECTIONS.REPORTS.name,
      reportsRequiredAttributes
    );
    console.log("Creating attributes for Reports Collection...");

    // Add longer delay after collection creation
    await delay(2000);
    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "incident_type",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "incident_type",
          255,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "incident_date",
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "incident_date",
          false
        )
    );
    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "reported_by",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "reported_by",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "status",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "status",
          50,
          false,
          "pending"
        )
    );
    console.log("Reports Collection attributes created successfully.");

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_incident_type",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "idx_incident_type",
          "key",
          ["incident_type"]
        )
    );

    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_status",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "idx_status",
          "key",
          ["status"]
        )
    );

    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      "idx_reported_by",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          "idx_reported_by",
          "key",
          ["reported_by"]
        )
    );
    console.log("Reports Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 2. Report Metadata Collection (8 attributes - moved from overflow)
    console.log("\n🔄 Step 2/7: Setting up Report Metadata Collection...");
    const reportMetadataRequiredAttributes = [
      "report_id",
      "incident_time",
      "is_in_progress",
      "description",
      "is_victim_reporter",
      "created_at",
      "updated_at",
      "priority_level",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.name,
      reportMetadataRequiredAttributes
    );
    console.log("Creating attributes for Report Metadata Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "incident_time",
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "incident_time",
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "is_in_progress",
      () =>
        databases.createBooleanAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "is_in_progress",
          false,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "description",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "description",
          10000,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "is_victim_reporter",
      () =>
        databases.createBooleanAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "is_victim_reporter",
          false,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "created_at",
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "created_at",
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "updated_at",
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "updated_at",
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "priority_level",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "priority_level",
          50,
          false,
          "medium"
        )
    );

    console.log("Report Metadata Collection attributes created successfully.");

    // Create indexes for Report Metadata Collection
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );

    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
      "idx_priority_level",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_METADATA.id,
          "idx_priority_level",
          "key",
          ["priority_level"]
        )
    );
    console.log("Report Metadata Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 3. Report Locations Collection (6 attributes)
    console.log("\n🔄 Step 3/7: Setting up Report Locations Collection...");
    const locationsRequiredAttributes = [
      "report_id",
      "location_address",
      "location_type",
      "location_details",
      "latitude",
      "longitude",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.name,
      locationsRequiredAttributes
    );
    console.log("Creating attributes for Report Locations Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "location_address",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "location_address",
          500,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "location_type",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "location_type",
          100,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "location_details",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "location_details",
          5000,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "latitude",
      () =>
        databases.createFloatAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "latitude",
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "longitude",
      () =>
        databases.createFloatAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "longitude",
          false
        )
    );

    console.log("Report Locations Collection attributes created successfully.");

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );
    console.log("Report Locations Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 4. Report Reporter Info Collection (4 attributes)
    console.log("\n🔄 Step 4/7: Setting up Report Reporter Info Collection...");
    const reporterInfoRequiredAttributes = [
      "report_id",
      "reporter_name",
      "reporter_phone",
      "reporter_email",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.name,
      reporterInfoRequiredAttributes
    );
    console.log("Creating attributes for Report Reporter Info Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "reporter_name",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
          "reporter_name",
          255,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "reporter_phone",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
          "reporter_phone",
          50,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "reporter_email",
      () =>
        databases.createEmailAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
          "reporter_email",
          false
        )
    );

    console.log(
      "Report Reporter Info Collection attributes created successfully."
    );

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );
    console.log(
      "Report Reporter Info Collection indexes created successfully."
    );

    // Add delay before next collection
    await delay(3000);

    // 5. Report Victims Collection (3 attributes)
    console.log("\n🔄 Step 5/7: Setting up Report Victims Collection...");
    const victimsRequiredAttributes = [
      "report_id",
      "victim_name",
      "victim_contact",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.name,
      victimsRequiredAttributes
    );
    console.log("Creating attributes for Report Victims Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "victim_name",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          "victim_name",
          255,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "victim_contact",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          "victim_contact",
          255,
          false
        )
    );

    console.log("Report Victims Collection attributes created successfully.");

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );
    console.log("Report Victims Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 6. Report Suspects Collection (3 attributes)
    console.log("\n🔄 Step 6/7: Setting up Report Suspects Collection...");
    const suspectsRequiredAttributes = [
      "report_id",
      "suspect_description",
      "suspect_vehicle",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.name,
      suspectsRequiredAttributes
    );
    console.log("Creating attributes for Report Suspects Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "suspect_description",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          "suspect_description",
          10000,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "suspect_vehicle",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          "suspect_vehicle",
          255,
          false
        )
    );

    console.log("Report Suspects Collection attributes created successfully."); // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );
    console.log("Report Suspects Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 7. Report Witnesses Collection (2 attributes)
    console.log("\n🔄 Step 7/8: Setting up Report Witnesses Collection...");
    const witnessesRequiredAttributes = ["report_id", "witness_info"];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.name,
      witnessesRequiredAttributes
    );
    console.log("Creating attributes for Report Witnesses Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "witness_info",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
          "witness_info",
          10000,
          false
        )
    );

    console.log("Report Witnesses Collection attributes created successfully.");

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );
    console.log("Report Witnesses Collection indexes created successfully.");

    // Add delay before next collection
    await delay(3000);

    // 8. Report Media Collection (5 attributes)
    console.log("\n🔄 Step 8/8: Setting up Report Media Collection...");
    const mediaRequiredAttributes = [
      "report_id",
      "file_id",
      "media_type",
      "file_name_original",
      "file_url",
      "display_order",
    ];

    await createCollectionIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.name,
      mediaRequiredAttributes
    );
    console.log("Creating attributes for Report Media Collection...");

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "report_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "report_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "file_id",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "file_id",
          255,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "media_type",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "media_type",
          50,
          true
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "file_name_original",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "file_name_original",
          255,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "file_url",
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "file_url",
          255,
          false
        )
    );

    await createAttributeIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "display_order",
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "display_order",
          false,
          0
        )
    );

    console.log("Report Media Collection attributes created successfully.");

    // Create indexes using helper function
    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "idx_report_id",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "idx_report_id",
          "key",
          ["report_id"]
        )
    );

    await createIndexIfNotExists(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
      "idx_media_type",
      () =>
        databases.createIndex(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          "idx_media_type",
          "key",
          ["media_type"]
        )
    );
    console.log("Report Media Collection indexes created successfully.");

    console.log(
      "\n🎉 === All normalized collections setup completed successfully! === 🎉"
    );
    console.log("✅ Collections created with retry logic and delays:");
    console.log("   📋 Reports (4 attributes): Core incident information");
    console.log(
      "   📊 Report Metadata (8 attributes): Additional incident data"
    );
    console.log(
      "   📍 Report Locations (6 attributes): Location details with coordinates"
    );
    console.log(
      "   👤 Report Reporter Info (4 attributes): Reporter contact information"
    );
    console.log("   👥 Report Victims (3 attributes): Victim information");
    console.log("   🕵️ Report Suspects (3 attributes): Suspect information");
    console.log("   👁️ Report Witnesses (2 attributes): Witness information");
    console.log(
      "   📷 Report Media (5 attributes): Photos, videos, and audio files"
    );
    console.log(
      "\n🔄 Setup completed with timeout protection and retry mechanisms"
    );
  } catch (error) {
    console.error("\n❌ Error setting up normalized collections:");

    // Better error handling for timeout issues
    if (
      error.code === 503 ||
      error.message.includes("timeout") ||
      error.message.includes("503")
    ) {
      console.error(
        "🔄 This appears to be a timeout error. The Appwrite server may be slow or overloaded."
      );
      console.error("💡 Suggestions:");
      console.error("   - Wait a few minutes and restart the server");
      console.error("   - Check your internet connection");
      console.error("   - Verify Appwrite server status");
      console.error(
        "   - The retry logic should help, but server may need more time"
      );
    }

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Message:", error.response.data?.message);
      console.error("Type:", error.response.data?.type);
      console.error("Code:", error.response.data?.code);
    } else {
      console.error("Error message:", error.message || error);
      console.error("Error code:", error.code);
      if (error.code === 503) {
        console.error("Response body:", error.response);
      }
    }
    throw error; // Re-throw the error
  }
}

module.exports = {
  setupNormalizedCollections,
  setupAppwriteBuckets,
  recreateCollection,
  databases,
  storage,
  NORMALIZED_COLLECTIONS,
  STORAGE_BUCKETS,
};
