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

    let queries = [Query.limit(limit), Query.orderDesc("timestamp")];

    // Add status filter if provided
    if (status) {
      queries.push(Query.equal("status", status));
    }

    // Add time filter if provided
    if (since) {
      queries.push(Query.greaterThan("timestamp", since));
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

    console.log(
      `✅ [DATABASE UPDATE] Emergency ping ${sessionId} location updated via WebSocket`
    );
    console.log(
      `   📍 New coordinates: ${locationData.latitude}, ${locationData.longitude}`
    );
    console.log(`   🕐 Last ping time: ${document.lastPing}`);

    return document;
  } catch (error) {
    console.error(
      `❌ [DATABASE ERROR] Failed to update emergency ping location via WebSocket ${sessionId}:`,
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
    console.log(`[EMERGENCY] Client connected: ${socket.id}`); // Handle emergency location updates
    socket.on("emergency-location-update", async (data) => {
      try {
        const currentTime = new Date().toISOString();
        console.log(`\n📍 [EMERGENCY PING UPDATE] ${currentTime}`);
        console.log(`   Client: ${socket.id}`);
        console.log(`   Session: ${data.sessionId}`);
        console.log(`   Coordinates: ${data.latitude}, ${data.longitude}`);
        console.log(`   User: ${data.userId || "anonymous"}`);
        console.log(`   Timestamp: ${data.timestamp}`);

        const { sessionId, latitude, longitude, timestamp, userId } = data;

        if (!sessionId || !latitude || !longitude) {
          console.log(
            `❌ [EMERGENCY] Missing required fields for session ${sessionId}`
          );
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
        ); // Emit confirmation back to client
        socket.emit("emergency-location-updated", {
          sessionId,
          timestamp: updatedDocument.lastPing,
          success: true,
        });

        // Get the IO instance for proper broadcasting
        const io = socket.server;

        // Broadcast to map clients using the proper broadcast function
        broadcastEmergencyPingUpdated(io, {
          id: sessionId,
          $id: sessionId,
          latitude: latitude,
          longitude: longitude,
          lastLatitude: latitude,
          lastLongitude: longitude,
          lastPing: updatedDocument.lastPing,
          timestamp: updatedDocument.timestamp,
          userId: userId,
          status: updatedDocument.status || "active",
        });

        console.log(`✅ [EMERGENCY] Database updated for session ${sessionId}`);
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
    }); // Handle emergency session leave
    socket.on("leave-emergency-session", (sessionId) => {
      socket.leave(`emergency-${sessionId}`);
      console.log(
        `[EMERGENCY] Client ${socket.id} left emergency session ${sessionId}`
      );

      // Notify map clients that this emergency ping has ended
      socket.to("map-updates").emit("emergency-ping-ended", sessionId);
      console.log(`[MAP] Broadcasted emergency ping ended: ${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[EMERGENCY] Client disconnected: ${socket.id}`);
      // Note: We could track active sessions per socket and end them on disconnect
      // but that would require additional session management
    });
  });
}

/**
 * Setup map-specific WebSocket handlers for real-time emergency ping updates
 */
function setupMapWebSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[MAP] Client connected: ${socket.id}`);

    // Handle map room join
    socket.on("map-join", () => {
      socket.join("map-updates");
      console.log(`[MAP] Client ${socket.id} joined map-updates room`);
    });

    // Handle map room leave
    socket.on("map-leave", () => {
      socket.leave("map-updates");
      console.log(`[MAP] Client ${socket.id} left map-updates room`);
    }); // Handle request for active emergency pings - DISABLED for real-time only map
    // socket.on("get-active-emergency-pings", async () => {
    //   try {
    //     const activePings = await getRecentEmergencyPings({
    //       status: "active",
    //       limit: 50,
    //     });
    //     socket.emit("active-emergency-pings", activePings);
    //   } catch (error) {
    //     console.error("Error fetching active emergency pings:", error);
    //     socket.emit("emergency-error", {
    //       error: "Failed to fetch emergency pings",
    //       message: error.message,
    //     });
    //   }
    // });    // Handle request for emergency pings by location - DISABLED for real-time only map
    // socket.on("get-emergency-pings-by-location", async (data) => {
    //   try {
    //     const { latitude, longitude, radius = 10 } = data;
    //     const pings = await getEmergencyPingsByLocation(
    //       latitude,
    //       longitude,
    //       radius
    //     );
    //     socket.emit("emergency-pings-by-location", pings);
    //   } catch (error) {
    //     console.error("Error fetching emergency pings by location:", error);
    //     socket.emit("emergency-error", {
    //       error: "Failed to fetch emergency pings by location",
    //       message: error.message,
    //     });
    //   }
    // });
  });
}

/**
 * Get emergency pings near a specific location
 */
async function getEmergencyPingsByLocation(latitude, longitude, radius = 10) {
  try {
    // Convert radius from kilometers to approximate degrees
    // 1 degree latitude ≈ 111 km
    // 1 degree longitude ≈ 111 km * cos(latitude)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

    // Calculate bounding box
    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLng = longitude - lngDelta;
    const maxLng = longitude + lngDelta;

    console.log(
      `Searching for emergency pings near ${latitude}, ${longitude} within ${radius}km`
    );

    let queries = [
      Query.between("latitude", minLat, maxLat),
      Query.between("longitude", minLng, maxLng),
      Query.orderDesc("timestamp"),
      Query.limit(50),
    ];

    const response = await databases.listDocuments(
      DATABASE_ID,
      EMERGENCY_PINGS_COLLECTION_ID,
      queries
    );

    console.log(`Found ${response.documents.length} emergency pings in area`);
    return response.documents;
  } catch (error) {
    console.error("Error fetching emergency pings by location:", error);
    throw error;
  }
}

/**
 * Broadcast emergency ping creation to map clients
 */
function broadcastEmergencyPingCreated(io, ping) {
  io.to("map-updates").emit("emergency-ping-created", ping);
  console.log(`[MAP] Broadcasted emergency ping created: ${ping.id}`);
}

/**
 * Broadcast emergency ping update to map clients
 */
function broadcastEmergencyPingUpdated(io, ping) {
  io.to("map-updates").emit("emergency-ping-updated", ping);
  console.log(`[MAP] Broadcasted emergency ping updated: ${ping.id}`);
}

/**
 * Broadcast emergency ping response to map clients
 */
function broadcastEmergencyPingResponded(io, ping) {
  io.to("map-updates").emit("emergency-ping-responded", ping);
  console.log(`[MAP] Broadcasted emergency ping responded: ${ping.id}`);
}

module.exports = {
  setupEmergencyPingsCollection,
  createEmergencyPing,
  getRecentEmergencyPings,
  updateEmergencyPingStatus,
  updateEmergencyPingLocation,
  updateEmergencyPingLocationWebSocket,
  setupEmergencyWebSocketHandlers,
  setupMapWebSocketHandlers,
  broadcastEmergencyPingCreated,
  broadcastEmergencyPingUpdated,
  broadcastEmergencyPingResponded,
  getEmergencyPingsByLocation,
};
