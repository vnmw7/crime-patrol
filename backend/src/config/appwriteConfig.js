const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

const NORMALIZED_COLLECTIONS = {
  REPORTS: {
    id: process.env.APPWRITE_REPORTS_COLLECTION_ID || "reports_main",
    name: process.env.APPWRITE_REPORTS_COLLECTION_NAME || "Reports",
  },
  REPORT_LOCATIONS: {
    id:
      process.env.APPWRITE_REPORT_LOCATIONS_COLLECTION_ID || "report_locations",
    name:
      process.env.APPWRITE_REPORT_LOCATIONS_COLLECTION_NAME ||
      "Report Locations",
  },
  REPORT_REPORTER_INFO: {
    id:
      process.env.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID ||
      "report_reporter_info",
    name:
      process.env.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_NAME ||
      "Report Reporter Info",
  },
  REPORT_VICTIMS: {
    id: process.env.APPWRITE_REPORT_VICTIMS_COLLECTION_ID || "report_victims",
    name:
      process.env.APPWRITE_REPORT_VICTIMS_COLLECTION_NAME || "Report Victims",
  },
  REPORT_SUSPECTS: {
    id: process.env.APPWRITE_REPORT_SUSPECTS_COLLECTION_ID || "report_suspects",
    name:
      process.env.APPWRITE_REPORT_SUSPECTS_COLLECTION_NAME || "Report Suspects",
  },
  REPORT_WITNESSES: {
    id:
      process.env.APPWRITE_REPORT_WITNESSES_COLLECTION_ID || "report_witnesses",
    name:
      process.env.APPWRITE_REPORT_WITNESSES_COLLECTION_NAME ||
      "Report Witnesses",
  },
  REPORT_MEDIA: {
    id: process.env.APPWRITE_REPORT_MEDIA_COLLECTION_ID || "report_media",
    name: process.env.APPWRITE_REPORT_MEDIA_COLLECTION_NAME || "Report Media",
  },
  REPORT_METADATA: {
    id: process.env.APPWRITE_REPORT_METADATA_COLLECTION_ID || "report_metadata",
    name:
      process.env.APPWRITE_REPORT_METADATA_COLLECTION_NAME || "Report Metadata",
  },
};

module.exports = {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  DATABASE_ID: APPWRITE_DATABASE_ID,
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
  NORMALIZED_COLLECTIONS,
};
