const path = require("path");
// Corrected path to .env file located in the Mobile subdirectory
const dotenvPath = path.join(__dirname, "..", "Mobile", ".env");
console.log("Attempting to load .env from:", dotenvPath);

const dotenvResult = require("dotenv").config({ path: dotenvPath });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
}

console.log("Parsed .env variables (if any):", dotenvResult.parsed);

const sdk = require("node-appwrite");

// Log environment variables to verify they are loaded
console.log("APPWRITE_ENDPOINT:", process.env.APPWRITE_ENDPOINT);
console.log("APPWRITE_PROJECT_ID:", process.env.APPWRITE_PROJECT_ID);
console.log("APPWRITE_API_KEY is set:", !!process.env.APPWRITE_API_KEY); // Don't log the key itself

async function testAppwrite() {
  console.log("Starting testAppwrite function..."); // New log
  if (
    !process.env.APPWRITE_ENDPOINT ||
    !process.env.APPWRITE_PROJECT_ID ||
    !process.env.APPWRITE_API_KEY
  ) {
    console.error(
      "Missing one or more required environment variables: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY"
    );
    return;
  }

  const client = new sdk.Client();
  console.log("Appwrite client initialized."); // New log
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // API Key for server-side operations

  const storage = new sdk.Storage(client);
  console.log("Appwrite storage initialized."); // New log

  try {
    console.log("Attempting to list buckets...");
    const response = await storage.listBuckets();
    console.log(
      "Successfully listed buckets:",
      JSON.stringify(response, null, 2)
    ); // Prettier log
    if (response.total === 0) {
      console.log(
        "No buckets found. Please ensure you have created buckets in your Appwrite project."
      );
    } else {
      response.buckets.forEach((bucket) => {
        console.log(
          `Bucket Name: ${bucket.name}, Bucket ID: ${
            bucket["$id"]
          }, Permissions: ${JSON.stringify(bucket["$permissions"])}`
        ); // Added permissions
      });
    }
  } catch (error) {
    console.error("Failed to list buckets:", JSON.stringify(error, null, 2)); // Prettier log
  }
  console.log("Finished testAppwrite function."); // New log
}

console.log("Script execution started."); // New log
testAppwrite();
console.log("Script execution finished."); // New log
