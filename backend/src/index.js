require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const {
  setupNormalizedCollections,
  setupAppwriteBuckets,
} = require("./services/appwriteService.js");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const reportsRouter = require("./routes/reports");
app.use("/api/reports", reportsRouter);

async function initializeAppwrite() {
  try {
    console.log("Initializing Appwrite normalized collections setup...");
    await setupNormalizedCollections();
    await setupAppwriteBuckets();
    console.log(
      "Appwrite normalized collections setup completed successfully."
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
    },
    endpoints: {
      "POST /api/reports": "Create new report",
      "GET /api/reports": "List reports with filters",
      "GET /api/reports/:id": "Get complete report by ID",
      "PATCH /api/reports/:id/status": "Update report status",
      "GET /api/reports/location/:lat/:lng": "Get reports by location",
    },
    status_values: ["pending", "approved", "rejected", "responded", "solved"],
  });
});

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await initializeAppwrite();
});
