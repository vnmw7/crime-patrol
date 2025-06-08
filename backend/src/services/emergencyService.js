const {
  Client,
  Databases,
  ID,
  Query,
  Permission,
  Role,
} = require("node-appwrite");
const {
  DATABASE_ID,
  NORMALIZED_COLLECTIONS,
} = require("../config/appwriteConfig");

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const EMERGENCY_PINGS_COLLECTION_ID = NORMALIZED_COLLECTIONS.EMERGENCY_PINGS.id;
const EMERGENCY_PINGS_COLLECTION_NAME =
  NORMALIZED_COLLECTIONS.EMERGENCY_PINGS.name;

/**
 * Setup emergency pings collection in Appwrite
 */
async function setupEmergencyPingsCollection() {
  try {
    console.log("Setting up emergency pings collection..."); // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, EMERGENCY_PINGS_COLLECTION_ID);
      console.log("Emergency pings collection already exists");
      return;
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
    }

    // Create the collection
    await databases.createCollection(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      EMERGENCY_PINGS_COLLECTION_NAME,
      [
        Permission.create(Role.any()),
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
      false, // not document security
      true // enabled
    );

    // Create attributes
    const attributes = [
      { key: "id", type: "string", size: 255, required: true },
      { key: "latitude", type: "double", required: true },
      { key: "longitude", type: "double", required: true },
      { key: "timestamp", type: "datetime", required: true },
      { key: "userId", type: "string", size: 255, required: false },
      {
        key: "status",
        type: "string",
        size: 50,
        required: false,
        default: "pending",
      },
      { key: "lastLatitude", type: "double", required: false },
      { key: "lastLongitude", type: "double", required: false },
      { key: "lastPing", type: "datetime", required: false },
      { key: "respondedBy", type: "string", size: 255, required: false },
      { key: "respondedAt", type: "datetime", required: false },
    ];

    for (const attr of attributes) {
      console.log(`Creating attribute: ${attr.key}`);
      if (attr.type === "double") {
        await databases.createFloatAttribute(
          DATABASE_ID,
          EMERGENCY_PINGS_COLLECTION_ID,
          attr.key,
          attr.required,
          undefined, // min
          undefined, // max
          attr.default
        );
      } else if (attr.type === "datetime") {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          EMERGENCY_PINGS_COLLECTION_ID,
          attr.key,
          attr.required,
          attr.default
        );
      } else if (attr.type === "string") {
        await databases.createStringAttribute(
          DATABASE_ID,
          EMERGENCY_PINGS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
      }

      // Wait a bit between attribute creations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Create indexes for better query performance
    console.log("Creating indexes...");

    // Index for status queries
    await databases.createIndex(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      "status_index",
      "key",
      ["status"]
    );

    // Index for timestamp queries
    await databases.createIndex(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      "timestamp_index",
      "key",
      ["timestamp"]
    );

    // Index for userId queries
    await databases.createIndex(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      "userId_index",
      "key",
      ["userId"]
    );

    console.log("Emergency pings collection setup completed successfully");
  } catch (error) {
    console.error("Error setting up emergency pings collection:", error);
    throw error;
  }
}

/**
 * Create a new emergency ping record
 */
async function createEmergencyPing(pingData) {
  try {
    const uniqueId = ID.unique(); // Generate unique ID
    const document = await databases.createDocument(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      uniqueId, // Use uniqueId for document ID
      {
        id: uniqueId, // Add uniqueId to the payload
        latitude: pingData.latitude,
        longitude: pingData.longitude,
        timestamp: pingData.timestamp || new Date().toISOString(),
        userId: pingData.userId || null,
        status: pingData.status || "pending",
        lastPing: pingData.lastPing || new Date().toISOString(),
        respondedBy: null,
        respondedAt: null,
      }
    );

    console.log(`Emergency ping created with ID: ${document.$id}`);
    return document;
  } catch (error) {
    console.error("Error creating emergency ping:", error);
    throw error;
  }
}

/**
 * Get recent emergency pings with filtering
 */
async function getRecentEmergencyPings(options = {}) {
  try {
    const { limit = 50, status = "active", since } = options;

    let queries = [Query.limit(limit), Query.orderDesc("receivedAt")];

    // Add status filter if provided
    if (status) {
      queries.push(Query.equal("status", status));
    }

    // Add time filter if provided
    if (since) {
      queries.push(Query.greaterThan("receivedAt", since));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching emergency pings:", error);
    throw error;
  }
}

/**
 * Update emergency ping status
 */
async function updateEmergencyPingStatus(pingId, status, respondedBy = null) {
  try {
    const updateData = {
      status,
      respondedBy,
    };

    // If resolving, add resolved timestamp
    if (status === "resolved") {
      updateData.resolvedAt = new Date().toISOString();
    }

    const document = await databases.updateDocument(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      pingId,
      updateData
    );

    console.log(`Emergency ping ${pingId} status updated to: ${status}`);
    return document;
  } catch (error) {
    console.error(`Error updating emergency ping ${pingId}:`, error);
    throw error;
  }
}

/**
 * Update emergency ping location data for continuous pinging
 */
async function updateEmergencyPingLocation(pingId, locationData) {
  try {
    const updateData = {
      lastLatitude: locationData.latitude,
      lastLongitude: locationData.longitude,
      lastPing: locationData.timestamp || new Date().toISOString(),
    };

    const document = await databases.updateDocument(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      pingId,
      updateData
    );

    console.log(`Emergency ping ${pingId} location updated`);
    return document;
  } catch (error) {
    console.error(`Error updating emergency ping location ${pingId}:`, error);
    throw error;
  }
}

/**
 * Update emergency ping location data for continuous pinging via WebSocket
 */
async function updateEmergencyPingLocationWebSocket(sessionId, locationData) {
  try {
    const updateData = {
      lastLatitude: locationData.latitude,
      lastLongitude: locationData.longitude,
      lastPing: locationData.timestamp || new Date().toISOString(),
    };

    const document = await databases.updateDocument(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      sessionId,
      updateData
    );

    console.log(`Emergency ping ${sessionId} location updated via WebSocket`);
    return document;
  } catch (error) {
    console.error(
      `Error updating emergency ping location via WebSocket ${sessionId}:`,
      error
    );
    throw error;
  }
}

/**
 * Setup WebSocket handlers for emergency location updates
 */
function setupEmergencyWebSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[EMERGENCY] Client connected: ${socket.id}`);

    // Handle emergency location updates
    socket.on("emergency-location-update", async (data) => {
      try {
        console.log(
          `[EMERGENCY] Received location update from ${socket.id}:`,
          data
        );

        const { sessionId, latitude, longitude, timestamp, userId } = data;

        if (!sessionId || !latitude || !longitude) {
          socket.emit("emergency-error", {
            error: "Missing required fields: sessionId, latitude, longitude",
          });
          return;
        }

        // Update the emergency ping document
        const updatedDocument = await updateEmergencyPingLocationWebSocket(
          sessionId,
          {
            latitude,
            longitude,
            timestamp,
          }
        );

        // Emit confirmation back to client
        socket.emit("emergency-location-updated", {
          sessionId,
          timestamp: updatedDocument.lastPing,
          success: true,
        });

        // Broadcast to emergency services room for real-time monitoring
        socket.to("emergency-services").emit("emergency-ping-updated", {
          sessionId,
          latitude,
          longitude,
          timestamp: updatedDocument.lastPing,
          userId,
        });

        console.log(`[EMERGENCY] Location updated for session ${sessionId}`);
      } catch (error) {
        console.error(`[EMERGENCY] Error handling location update:`, error);
        socket.emit("emergency-error", {
          error: "Failed to update location",
          message: error.message,
        });
      }
    });

    // Handle emergency session join
    socket.on("join-emergency-session", (sessionId) => {
      socket.join(`emergency-${sessionId}`);
      console.log(
        `[EMERGENCY] Client ${socket.id} joined emergency session ${sessionId}`
      );
    });

    // Handle emergency session leave
    socket.on("leave-emergency-session", (sessionId) => {
      socket.leave(`emergency-${sessionId}`);
      console.log(
        `[EMERGENCY] Client ${socket.id} left emergency session ${sessionId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(`[EMERGENCY] Client disconnected: ${socket.id}`);
    });
  });
}

/**
 * Get emergency pings by location (within radius)
 */
async function getEmergencyPingsByLocation(latitude, longitude, radiusKm = 10) {
  try {
    // For now, get all active pings and filter client-side
    // In production, you'd want to use geospatial queries if supported
    const pings = await getRecentEmergencyPings({
      status: "active",
      limit: 100,
    });

    // Filter by distance (simple calculation)
    const filteredPings = pings.filter((ping) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        ping.latitude,
        ping.longitude
      );
      return distance <= radiusKm;
    });

    return filteredPings;
  } catch (error) {
    console.error("Error fetching emergency pings by location:", error);
    throw error;
  }
}

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  setupEmergencyPingsCollection,
  createEmergencyPing,
  getRecentEmergencyPings,
  updateEmergencyPingStatus,
  updateEmergencyPingLocation,
  updateEmergencyPingLocationWebSocket,
  setupEmergencyWebSocketHandlers,
  getEmergencyPingsByLocation,
};
