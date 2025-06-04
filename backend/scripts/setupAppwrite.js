import { setupNormalizedCollections } from "./setupNormalizedDatabase.js";
import dotenv from "dotenv";

// --- Run the setup function ---
async function main() {
  console.log("Starting Crime Patrol normalized database setup...");
  // Ensure environment variables are loaded if you use a .env file
  dotenv.config({ path: "../.env" }); // Adjust path if your .env is elsewhere

  await setupNormalizedCollections();
  console.log("Crime Patrol normalized database setup finished successfully!");
}

main().catch((error) => {
  console.error("Failed to run Appwrite setup script:", error);
  process.exit(1);
});
