const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve static files from current directory

// Make io available to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

  socket.on("join-emergency-services", () => {
    socket.join("emergency-services");
    console.log(
      `[SOCKET.IO] Client ${socket.id} joined emergency-services room`
    );
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
  });
});

// Simple in-memory storage for testing
let emergencyPings = [];
let pingIdCounter = 1;

// Emergency location ping endpoint
app.post("/api/emergency/location", (req, res) => {
  try {
    const { latitude, longitude, timestamp, userId, emergencyContact } =
      req.body;

    // Validate required fields
    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({
        error: "Missing required fields: latitude, longitude, timestamp",
        received: req.body,
      });
    }

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        error:
          "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180",
        received: { latitude, longitude },
      });
    }

    console.log(`[EMERGENCY PING] Received location ping:`, {
      latitude,
      longitude,
      timestamp,
      userId: userId || "anonymous",
      emergencyContact,
    });

    // Create emergency ping record
    const emergencyPing = {
      id: `ping_${pingIdCounter++}`,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp,
      userId: userId || "anonymous",
      emergencyContact: emergencyContact || null,
      status: "active",
      receivedAt: new Date().toISOString(),
    };

    emergencyPings.unshift(emergencyPing); // Add to beginning

    // Emit real-time notification to connected clients
    io.emit("emergency-ping", emergencyPing);
    console.log(
      `[EMERGENCY PING] Real-time notification sent for ping ID: ${emergencyPing.id}`
    );

    res.status(201).json({
      success: true,
      message: "Emergency location ping received successfully",
      data: {
        id: emergencyPing.id,
        latitude: emergencyPing.latitude,
        longitude: emergencyPing.longitude,
        timestamp: emergencyPing.timestamp,
        receivedAt: emergencyPing.receivedAt,
        status: emergencyPing.status,
      },
    });
  } catch (error) {
    console.error("[EMERGENCY PING] Error processing location ping:", error);
    res.status(500).json({
      error: "Internal server error while processing emergency ping",
      message: error.message,
    });
  }
});

// Get recent emergency pings
app.get("/api/emergency/pings", (req, res) => {
  try {
    const { limit = 50, status = "active" } = req.query;

    console.log(`[EMERGENCY PINGS] Fetching recent pings with filters:`, {
      limit: parseInt(limit),
      status,
    });

    let filteredPings = emergencyPings;
    if (status && status !== "all") {
      filteredPings = emergencyPings.filter((ping) => ping.status === status);
    }

    const limitedPings = filteredPings.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: limitedPings.length,
      data: limitedPings,
    });
  } catch (error) {
    console.error("[EMERGENCY PINGS] Error fetching emergency pings:", error);
    res.status(500).json({
      error: "Internal server error while fetching emergency pings",
      message: error.message,
    });
  }
});

// Update emergency ping status
app.patch("/api/emergency/ping/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status, respondedBy } = req.body;

    if (
      !status ||
      !["active", "responding", "resolved", "false_alarm"].includes(status)
    ) {
      return res.status(400).json({
        error:
          "Invalid status. Must be one of: active, responding, resolved, false_alarm",
      });
    }

    console.log(`[EMERGENCY PING] Updating ping ${id} status to: ${status}`);

    // Find and update the ping
    const pingIndex = emergencyPings.findIndex((ping) => ping.id === id);
    if (pingIndex === -1) {
      return res.status(404).json({
        error: `Emergency ping with ID ${id} not found`,
      });
    }

    emergencyPings[pingIndex].status = status;
    emergencyPings[pingIndex].respondedBy = respondedBy || "unknown";
    emergencyPings[pingIndex].updatedAt = new Date().toISOString();

    const updatedPing = emergencyPings[pingIndex];

    // Emit real-time update
    io.emit("emergency-ping-updated", {
      id: updatedPing.id,
      status: updatedPing.status,
      respondedBy: updatedPing.respondedBy,
      updatedAt: updatedPing.updatedAt,
    });

    res.json({
      success: true,
      message: `Emergency ping ${id} status updated to ${status}`,
      data: updatedPing,
    });
  } catch (error) {
    console.error("[EMERGENCY PING] Error updating ping status:", error);
    res.status(500).json({
      error: "Internal server error while updating emergency ping status",
      message: error.message,
    });
  }
});

// Serve the emergency dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/emergency-dashboard.html");
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Crime Patrol Emergency API",
    version: "1.0.0",
    endpoints: {
      "POST /api/emergency/location": "Receive emergency location ping",
      "GET /api/emergency/pings": "Get recent emergency pings",
      "PATCH /api/emergency/ping/:id/status": "Update emergency ping status",
      "GET /dashboard": "Emergency services dashboard",
    },
    realtime: {
      "emergency-ping": "Real-time emergency location notifications",
      "emergency-ping-updated": "Real-time ping status updates",
    },
    stats: {
      totalPings: emergencyPings.length,
      activePings: emergencyPings.filter((p) => p.status === "active").length,
      connectedClients: io.engine.clientsCount,
    },
  });
});

server.listen(port, () => {
  console.log(`🚨 Emergency Services Backend listening on port ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
  console.log(
    `🔌 Socket.IO server ready for real-time emergency notifications`
  );
  console.log(
    `📡 API Endpoint: http://localhost:${port}/api/emergency/location`
  );
});
