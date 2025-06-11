// Simple syntax test for our modified services
console.log("Testing syntax of modified services...");

try {
  // Test basic require without initialization
  require("./src/services/normalizedReportService.js");
  console.log("✅ normalizedReportService.js - syntax OK");
} catch (error) {
  console.error("❌ normalizedReportService.js error:", error.message);
}

try {
  require("./src/services/normalizedAppwriteService.js");
  console.log("✅ normalizedAppwriteService.js - syntax OK");
} catch (error) {
  console.error("❌ normalizedAppwriteService.js error:", error.message);
}

console.log("\n🎉 Syntax checks completed!");
