const {
  createCompleteReport,
  getCompleteReport,
  updateReportStatus,
  listReports,
} = require("../services/normalizedReportService.js");

/**
 * Example of how to create a complete crime report using the normalized structure
 */
async function exampleCreateReport() {
  try {
    console.log("Creating example crime report...");

    const reportData = {
      // Main report data (8 attributes max)
      incident_type: "Theft",
      incident_date: new Date().toISOString(),
      incident_time: new Date().toISOString(),
      is_in_progress: false,
      description:
        "Someone broke into my car and stole my laptop and phone. The incident happened around 3 PM when I was shopping at the mall.",
      reported_by: "user123", // This would be the actual user ID
      status: "pending",
      is_victim_reporter: true,

      // Location data (6 attributes max)
      location: {
        address: "123 Main Street, Downtown Mall Parking Lot",
        type: "Parking Lot",
        details: "Level 2, Section B, near the food court entrance",
        latitude: 40.7128,
        longitude: -74.006,
      },

      // Reporter information (4 attributes max)
      reporter_info: {
        name: "John Doe",
        phone: "+1234567890",
        email: "john.doe@example.com",
      },

      // Victims (3 attributes max per victim)
      victims: [
        {
          name: "John Doe",
          contact: "john.doe@example.com",
        },
      ],

      // Suspects (3 attributes max per suspect)
      suspects: [
        {
          description:
            "Male, approximately 5'8\", wearing dark hoodie and jeans, around 25-30 years old",
          vehicle: "White sedan, couldn't see license plate clearly",
        },
      ],

      // Witnesses (2 attributes max per witness)
      witnesses: [
        {
          info: "Mall security guard saw someone suspicious near the parking area around 3:15 PM. Security office has contact details.",
        },
      ],

      // Media files (5 attributes max per media item)
      media: [
        {
          file_id: "photo001", // This would be the actual file ID from Appwrite Storage
          media_type: "photo",
          file_name_original: "car_damage.jpg",
          display_order: 1,
        },
        {
          file_id: "photo002",
          media_type: "photo",
          file_name_original: "parking_lot_view.jpg",
          display_order: 2,
        },
      ],
    };

    const createdReport = await createCompleteReport(reportData);
    console.log("Report created successfully!");
    console.log("Report ID:", createdReport.mainReport.$id);

    return createdReport;
  } catch (error) {
    console.error("Error creating example report:", error);
    throw error;
  }
}

/**
 * Example of how to retrieve a complete report
 */
async function exampleGetReport(reportId) {
  try {
    console.log(`Retrieving report: ${reportId}`);

    const completeReport = await getCompleteReport(reportId);

    console.log("=== COMPLETE REPORT ===");
    console.log("Main Report:", completeReport.mainReport);
    console.log("Location:", completeReport.location);
    console.log("Reporter Info:", completeReport.reporter_info);
    console.log("Victims:", completeReport.victims);
    console.log("Suspects:", completeReport.suspects);
    console.log("Witnesses:", completeReport.witnesses);
    console.log("Media:", completeReport.media);

    return completeReport;
  } catch (error) {
    console.error("Error retrieving report:", error);
    throw error;
  }
}

/**
 * Example of how to update report status
 */
async function exampleUpdateStatus(reportId, newStatus) {
  try {
    console.log(`Updating report ${reportId} status to: ${newStatus}`);

    const updatedReport = await updateReportStatus(reportId, newStatus);
    console.log("Status updated successfully!");
    console.log("Updated report:", updatedReport);

    return updatedReport;
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
}

/**
 * Example of how to list reports with filters
 */
async function exampleListReports() {
  try {
    console.log("Listing all pending reports...");

    const pendingReports = await listReports({ status: "pending" });
    console.log(`Found ${pendingReports.length} pending reports`);

    for (const report of pendingReports) {
      console.log(
        `- ${report.incident_type}: ${report.description.substring(0, 50)}...`
      );
    }

    return pendingReports;
  } catch (error) {
    console.error("Error listing reports:", error);
    throw error;
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    console.log("🚀 Starting normalized database examples...\n");

    // Create a new report
    const newReport = await exampleCreateReport();
    const reportId = newReport.mainReport.$id;

    console.log("\n" + "=".repeat(50) + "\n");

    // Retrieve the complete report
    await exampleGetReport(reportId);

    console.log("\n" + "=".repeat(50) + "\n");

    // Update status
    await exampleUpdateStatus(reportId, "approved");

    console.log("\n" + "=".repeat(50) + "\n");

    // List reports
    await exampleListReports();

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

module.exports = {
  exampleCreateReport,
  exampleGetReport,
  exampleUpdateStatus,
  exampleListReports,
  runExamples,
};
