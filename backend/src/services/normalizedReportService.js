const { Client, Databases, ID } = require("node-appwrite");
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

/**
 * Create a complete crime report with all related data
 * @param {Object} reportData - The complete report data
 * @returns {Promise<Object>} - The created report with all related data
 */
async function createCompleteReport(reportData) {
  try {
    // 1. Create the main report
    const mainReportData = {
      incident_type: reportData.incident_type,
      incident_date: reportData.incident_date,
      incident_time: reportData.incident_time,
      is_in_progress: reportData.is_in_progress || false,
      description: reportData.description,
      reported_by: reportData.reported_by,
      status: reportData.status || "pending",
      is_victim_reporter: reportData.is_victim_reporter || false,
    };

    const mainReport = await databases.createDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      ID.unique(),
      mainReportData
    );

    const reportId = mainReport.$id;
    const createdData = { mainReport };

    // 2. Create location data if provided
    if (reportData.location) {
      const locationData = {
        report_id: reportId,
        location_address: reportData.location.address || "",
        location_type: reportData.location.type || "",
        location_details: reportData.location.details || "",
        latitude: reportData.location.latitude || 0.0,
        longitude: reportData.location.longitude || 0.0,
      };

      createdData.location = await databases.createDocument(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
        ID.unique(),
        locationData
      );
    }

    // 3. Create reporter info if provided
    if (reportData.reporter_info) {
      const reporterData = {
        report_id: reportId,
        reporter_name: reportData.reporter_info.name || "",
        reporter_phone: reportData.reporter_info.phone || "",
        reporter_email: reportData.reporter_info.email || "",
      };

      createdData.reporter_info = await databases.createDocument(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
        ID.unique(),
        reporterData
      );
    }

    // 4. Create victim data if provided
    if (reportData.victims && reportData.victims.length > 0) {
      createdData.victims = [];
      for (const victim of reportData.victims) {
        const victimData = {
          report_id: reportId,
          victim_name: victim.name || "",
          victim_contact: victim.contact || "",
        };

        const createdVictim = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
          ID.unique(),
          victimData
        );
        createdData.victims.push(createdVictim);
      }
    }

    // 5. Create suspect data if provided
    if (reportData.suspects && reportData.suspects.length > 0) {
      createdData.suspects = [];
      for (const suspect of reportData.suspects) {
        const suspectData = {
          report_id: reportId,
          suspect_description: suspect.description || "",
          suspect_vehicle: suspect.vehicle || "",
        };

        const createdSuspect = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
          ID.unique(),
          suspectData
        );
        createdData.suspects.push(createdSuspect);
      }
    }

    // 6. Create witness data if provided
    if (reportData.witnesses && reportData.witnesses.length > 0) {
      createdData.witnesses = [];
      for (const witness of reportData.witnesses) {
        const witnessData = {
          report_id: reportId,
          witness_info: witness.info || "",
        };

        const createdWitness = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
          ID.unique(),
          witnessData
        );
        createdData.witnesses.push(createdWitness);
      }
    }

    // 7. Create media data if provided
    if (reportData.media && reportData.media.length > 0) {
      createdData.media = [];
      for (const mediaItem of reportData.media) {
        const mediaData = {
          report_id: reportId,
          file_id: mediaItem.file_id,
          media_type: mediaItem.media_type, // "photo", "audio", "video"
          file_name_original: mediaItem.file_name_original || "",
          display_order: mediaItem.display_order || 0,
        };

        const createdMedia = await databases.createDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
          ID.unique(),
          mediaData
        );
        createdData.media.push(createdMedia);
      }
    }

    return createdData;
  } catch (error) {
    console.error("Error creating complete report:", error);
    throw error;
  }
}

/**
 * Get a complete report with all related data
 * @param {string} reportId - The report ID
 * @returns {Promise<Object>} - The complete report data
 */
async function getCompleteReport(reportId) {
  try {
    // Get the main report
    const mainReport = await databases.getDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      reportId
    );

    const completeReport = { mainReport };

    // Get location data
    try {
      const locationQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id,
        [`report_id=${reportId}`]
      );
      completeReport.location = locationQuery.documents[0] || null;
    } catch (error) {
      console.log("No location data found for report:", reportId);
      completeReport.location = null;
    }

    // Get reporter info
    try {
      const reporterQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_REPORTER_INFO.id,
        [`report_id=${reportId}`]
      );
      completeReport.reporter_info = reporterQuery.documents[0] || null;
    } catch (error) {
      console.log("No reporter info found for report:", reportId);
      completeReport.reporter_info = null;
    }

    // Get victims
    try {
      const victimsQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_VICTIMS.id,
        [`report_id=${reportId}`]
      );
      completeReport.victims = victimsQuery.documents;
    } catch (error) {
      console.log("No victims found for report:", reportId);
      completeReport.victims = [];
    }

    // Get suspects
    try {
      const suspectsQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_SUSPECTS.id,
        [`report_id=${reportId}`]
      );
      completeReport.suspects = suspectsQuery.documents;
    } catch (error) {
      console.log("No suspects found for report:", reportId);
      completeReport.suspects = [];
    }

    // Get witnesses
    try {
      const witnessesQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_WITNESSES.id,
        [`report_id=${reportId}`]
      );
      completeReport.witnesses = witnessesQuery.documents;
    } catch (error) {
      console.log("No witnesses found for report:", reportId);
      completeReport.witnesses = [];
    }

    // Get media
    try {
      const mediaQuery = await databases.listDocuments(
        DATABASE_ID,
        NORMALIZED_COLLECTIONS.REPORT_MEDIA.id,
        [`report_id=${reportId}`]
      );
      completeReport.media = mediaQuery.documents;
    } catch (error) {
      console.log("No media found for report:", reportId);
      completeReport.media = [];
    }

    return completeReport;
  } catch (error) {
    console.error("Error getting complete report:", error);
    throw error;
  }
}

/**
 * Update report status
 * @param {string} reportId - The report ID
 * @param {string} status - New status (pending, approved, rejected, responded, solved)
 * @returns {Promise<Object>} - The updated report
 */
async function updateReportStatus(reportId, status) {
  try {
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "responded",
      "solved",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    return await databases.updateDocument(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      reportId,
      { status }
    );
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

/**
 * List reports with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - List of reports
 */
async function listReports(filters = {}) {
  try {
    const queries = [];

    if (filters.status) {
      queries.push(`status=${filters.status}`);
    }
    if (filters.incident_type) {
      queries.push(`incident_type=${filters.incident_type}`);
    }
    if (filters.reported_by) {
      queries.push(`reported_by=${filters.reported_by}`);
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORTS.id,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error("Error listing reports:", error);
    throw error;
  }
}

/**
 * Get reports by location (within a radius)
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Radius in kilometers (optional, for future use)
 * @returns {Promise<Array>} - List of reports with locations
 */
async function getReportsByLocation(latitude, longitude, radiusKm = 10) {
  try {
    // Note: This is a basic implementation. For production, you might want to use
    // more sophisticated geospatial queries or a dedicated geospatial database
    const locations = await databases.listDocuments(
      DATABASE_ID,
      NORMALIZED_COLLECTIONS.REPORT_LOCATIONS.id
    );

    const reportsWithLocation = [];
    for (const location of locations.documents) {
      // Get the main report for each location
      try {
        const mainReport = await databases.getDocument(
          DATABASE_ID,
          NORMALIZED_COLLECTIONS.REPORTS.id,
          location.report_id
        );
        reportsWithLocation.push({
          ...mainReport,
          location,
        });
      } catch (error) {
        console.log(
          `Could not find main report for location: ${location.report_id}`
        );
      }
    }

    return reportsWithLocation;
  } catch (error) {
    console.error("Error getting reports by location:", error);
    throw error;
  }
}

module.exports = {
  createCompleteReport,
  getCompleteReport,
  updateReportStatus,
  listReports,
  getReportsByLocation,
  databases,
  NORMALIZED_COLLECTIONS,
};
