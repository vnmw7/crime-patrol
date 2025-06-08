require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure this properly for production
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 3000;

const {
  setupNormalizedCollections,
  setupAppwriteBuckets,
} = require("./services/appwriteService.js");

const {
  setupEmergencyPingsCollection,
} = require("./services/emergencyService.js");

const { setupUserCollections } = require("./services/userServices.js");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

  // Join emergency services room for real-time notifications
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

// Routes
const reportsRouter = require("./routes/reports");
const emergencyRouter = require("./routes/emergency");
const usersRouter = require("./routes/users");
app.use("/api/reports", reportsRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/users", usersRouter);

async function initializeAppwrite() {
  try {
    console.log("Initializing Appwrite normalized collections setup...");
    await setupNormalizedCollections();
    await setupAppwriteBuckets();
    await setupEmergencyPingsCollection();
    await setupUserCollections();
    console.log(
      "Appwrite normalized collections, emergency pings, and user collections setup completed successfully."
    );
  } catch (error) {
    console.error("Error during Appwrite initialization:", error);

    console.log("Server will continue running despite database setup errors.");
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Crime Patrol API - Normalized Database",
    version: "2.0.0",
    collections: {
      reports: "Core incident information (8 attributes)",
      report_locations: "Location details with coordinates (6 attributes)",
      report_reporter_info: "Reporter contact information (4 attributes)",
      report_victims: "Victim information (3 attributes)",
      report_suspects: "Suspect information (3 attributes)",
      report_witnesses: "Witness information (2 attributes)",
      report_media: "Photos, videos, and audio files (5 attributes)",
      users:
        "User basic information (4 attributes: firstName, lastName, role, isVerified)",
      user_contacts:
        "User contact information (4 attributes: email, phone, address, userId)",
      user_documents:
        "User ID documents (7 attributes: idPictureUrl, documentType, isVerified, uploadedAt, verifiedAt, verifiedBy, userId)",
    },
    endpoints: {
      "POST /api/reports": "Create new report",
      "GET /api/reports": "List reports with filters",
      "GET /api/reports/:id": "Get complete report by ID",
      "PATCH /api/reports/:id/status": "Update report status",
      "POST /api/emergency/location": "Receive emergency location ping",
      "GET /api/emergency/pings": "Get recent emergency pings",
      "PATCH /api/emergency/ping/:id/status": "Update emergency ping status",
      "GET /api/reports/location/:lat/:lng": "Get reports by location",
      "POST /api/users": "Create new user with contact info and documents",
      "GET /api/users": "List users with filters (include contacts/documents)",
      "GET /api/users/:id": "Get user by ID with contact info and documents",
      "GET /api/users/email/:email": "Find user by email",
      "PATCH /api/users/:id":
        "Update user information, contacts, and documents",
      "PATCH /api/users/:id/verify": "Toggle user verification",
      "PATCH /api/users/:id/document/verify": "Verify user document",
      "DELETE /api/users/:id": "Delete user and all associated data",
      "GET /api/users/role/:role": "Get users by role",
      "GET /api/users/verified/:status": "Get users by verification status",
      "GET /api/users/documents/pending":
        "Get users with pending document verification",
    },
    status_values: ["pending", "approved", "rejected", "responded", "solved"],
    user_roles: ["citizen", "police", "admin", "emergency_responder"],
    document_types: ["id_card", "passport", "drivers_license", "other"],
  });
});

server.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Socket.IO server ready for real-time emergency notifications`);
  await initializeAppwrite();
});
