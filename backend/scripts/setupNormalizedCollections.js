#!/usr/bin/env node

/**
 * Normalized Database Setup Script for Crime Patrol (CommonJS version)
 * This script creates multiple collections to normalize the database structure
 * Each collection has a maximum of 9 attributes for better organization
 *
 * Features:
 * - Map coordinates (Latitude, Longitude, Accuracy)
 * - Enhanced status system: pending, approved, rejected, responded, solved
 * - Normalized structure with proper relationships
 * - Proper indexing for performance
 */

const {
  setupNormalizedCollections,
} = require("../src/services/normalizedAppwriteService");

async function main() {
  try {
    console.log("🏗️  Starting Crime Patrol Normalized Database Setup...");
    console.log("=====================================");

    await setupNormalizedCollections();

    console.log("=====================================");
    console.log("✅ Normalized database setup completed successfully!");
    console.log("");
    console.log("📝 Next Steps:");
    console.log("1. Update your frontend to use the new normalized structure");
    console.log("2. Use createCompleteReport() to create reports");
    console.log("3. Use getCompleteReport() to retrieve full report data");
    console.log("4. Use updateReportStatus() to update report statuses");
    console.log("");
    console.log("🔧 Available Status Values:");
    console.log("- pending (default)");
    console.log("- approved");
    console.log("- rejected");
    console.log("- responded");
    console.log("- solved");
  } catch (error) {
    console.error(
      "❌ Failed to run normalized database setup script:",
      error.message
    );
    process.exit(1);
  }
}

// Run the setup
main();
