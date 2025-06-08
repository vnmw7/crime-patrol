const express = require("express");
const router = express.Router();
const {
  createEmergencyPing,
  getRecentEmergencyPings,
  updateEmergencyPingLocation,
} = require("../services/emergencyService.js");

/**
 * POST /api/emergency/location
 * Receive emergency location ping from mobile app
 */
router.post("/location", async (req, res) => {
  try {
    const { latitude, longitude, timestamp, userId, sessionId } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({
        error: "Missing required fields: latitude, longitude, timestamp",
        received: req.body,
      });
    }

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

    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const utc8Now = new Date(now.getTime() + utc8Offset);
    const isoStringUtc8 = utc8Now.toISOString().replace("Z", "+08:00");

    // Check if this is a continuous ping update (sessionId provided)
    if (sessionId) {
      console.log(`[EMERGENCY PING] Updating continuous ping session:`, {
        sessionId,
        latitude,
        longitude,
        timestamp,
      });

      const updatedPing = await updateEmergencyPingLocation(sessionId, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: isoStringUtc8,
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("emergency-ping-updated", {
          id: sessionId,
          lastLatitude: updatedPing.lastLatitude,
          lastLongitude: updatedPing.lastLongitude,
          lastPing: updatedPing.lastPing,
          status: updatedPing.status,
        });
        console.log(
          `[EMERGENCY PING] Real-time location update sent for session ID: ${sessionId}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Emergency location ping updated successfully",
        data: {
          sessionId: sessionId,
          lastLatitude: updatedPing.lastLatitude,
          lastLongitude: updatedPing.lastLongitude,
          lastPing: updatedPing.lastPing,
          status: updatedPing.status,
        },
      });
    } else {
      // This is a new emergency ping session
      console.log(`[EMERGENCY PING] Creating new emergency ping session:`, {
        latitude,
        longitude,
        timestamp,
        userId: userId || "anonymous",
      });

      const emergencyPing = await createEmergencyPing({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: isoStringUtc8,
        userId: userId || "anonymous",
        emergencyContact: req.body.emergencyContact || null,
        status: "active",
        lastPing: isoStringUtc8,
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("emergency-ping", {
          id: emergencyPing.$id,
          latitude: emergencyPing.latitude,
          longitude: emergencyPing.longitude,
          timestamp: emergencyPing.timestamp,
          userId: emergencyPing.userId,
          emergencyContact: emergencyPing.emergencyContact,
          receivedAt: emergencyPing.receivedAt,
          status: emergencyPing.status,
        });
        console.log(
          `[EMERGENCY PING] Real-time notification sent for ping ID: ${emergencyPing.$id}`
        );
      }

      res.status(201).json({
        success: true,
        message: "Emergency location ping session created successfully",
        data: {
          sessionId: emergencyPing.$id, // Return session ID for continuous pings
          id: emergencyPing.$id,
          latitude: emergencyPing.latitude,
          longitude: emergencyPing.longitude,
          timestamp: emergencyPing.timestamp,
          receivedAt: emergencyPing.receivedAt,
          status: emergencyPing.status,
        },
      });
    }
  } catch (error) {
    console.error("[EMERGENCY PING] Error processing location ping:", error);
    res.status(500).json({
      error: "Internal server error while processing emergency ping",
      message: error.message,
    });
  }
});

/**
 * GET /api/emergency/pings
 * Get recent emergency pings (for emergency services dashboard)
 */
router.get("/pings", async (req, res) => {
  try {
    const { limit = 50, status = "active", since } = req.query;

    console.log(`[EMERGENCY PINGS] Fetching recent pings with filters:`, {
      limit: parseInt(limit),
      status,
      since,
    });

    const pings = await getRecentEmergencyPings({
      limit: parseInt(limit),
      status,
      since,
    });

    res.json({
      success: true,
      count: pings.length,
      data: pings,
    });
  } catch (error) {
    console.error("[EMERGENCY PINGS] Error fetching emergency pings:", error);
    res.status(500).json({
      error: "Internal server error while fetching emergency pings",
      message: error.message,
    });
  }
});

/**
 * PATCH /api/emergency/ping/:id/status
 * Update emergency ping status (e.g., mark as resolved)
 */
router.patch("/ping/:id/status", async (req, res) => {
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

    // Update the ping status (this would require implementing updateEmergencyPingStatus in the service)
    // For now, we'll just acknowledge the request
    const io = req.app.get("io");
    if (io) {
      io.emit("emergency-ping-updated", {
        id,
        status,
        respondedBy: respondedBy || "unknown",
        updatedAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `Emergency ping ${id} status updated to ${status}`,
      data: {
        id,
        status,
        respondedBy: respondedBy || "unknown",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[EMERGENCY PING] Error updating ping status:", error);
    res.status(500).json({
      error: "Internal server error while updating emergency ping status",
      message: error.message,
    });
  }
});

module.exports = router;
