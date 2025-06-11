require("dotenv").config();
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
const port = process.env.PORT || 3000;

const {
  setupNormalizedCollections,
  setupAppwriteBuckets,
} = require("./services/appwriteService.js");

const {
  setupEmergencyPingsCollection,
} = require("./services/emergencyService.js");

const { setupUserCollections } = require("./services/userServices.js");
const { initializeSocketHandlers } = require("./services/socketHandlers.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("io", io);
initializeSocketHandlers(io);

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
    message: "Backend server is running",
    status: "OK",
  });
});

server.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await initializeAppwrite();
});
