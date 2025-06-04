const express = require("express");
const router = express.Router();
const {
  createCompleteReport,
  getCompleteReport,
  updateReportStatus,
  listReports,
  getReportsByLocation,
} = require("../services/normalizedReportService.js");

/**
 * POST /api/reports
 * Create a new crime report with normalized structure
 */
router.post("/", async (req, res) => {
  try {
    const reportData = req.body;

    // Validate required fields
    if (
      !reportData.incident_type ||
      !reportData.description ||
      !reportData.reported_by
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: incident_type, description, reported_by",
      });
    }

    const createdReport = await createCompleteReport(reportData);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: createdReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      error: "Failed to create report",
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/:id
 * Get a complete report by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const reportId = req.params.id;
    const completeReport = await getCompleteReport(reportId);

    res.json({
      success: true,
      data: completeReport,
    });
  } catch (error) {
    console.error("Error getting report:", error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.status(500).json({
      error: "Failed to retrieve report",
      details: error.message,
    });
  }
});

/**
 * GET /api/reports
 * List reports with optional filters
 */
router.get("/", async (req, res) => {
  try {
    const filters = {};

    // Extract query parameters
    if (req.query.status) filters.status = req.query.status;
    if (req.query.incident_type)
      filters.incident_type = req.query.incident_type;
    if (req.query.reported_by) filters.reported_by = req.query.reported_by;

    const reports = await listReports(filters);

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error listing reports:", error);
    res.status(500).json({
      error: "Failed to list reports",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update report status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "responded",
      "solved",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedReport = await updateReportStatus(reportId, status);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.status(500).json({
      error: "Failed to update report status",
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/location/:lat/:lng
 * Get reports by location (latitude/longitude)
 */
router.get("/location/:lat/:lng", async (req, res) => {
  try {
    const latitude = parseFloat(req.params.lat);
    const longitude = parseFloat(req.params.lng);
    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: "Invalid latitude or longitude",
      });
    }

    const reports = await getReportsByLocation(latitude, longitude, radiusKm);

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error getting reports by location:", error);
    res.status(500).json({
      error: "Failed to get reports by location",
      details: error.message,
    });
  }
});

module.exports = router;
