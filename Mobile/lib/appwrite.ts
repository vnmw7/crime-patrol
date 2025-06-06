import { Account, Client, ID, Databases } from "appwrite";
import Constants from "expo-constants";

// Initialize Appwrite client
// Prioritize environment variable (for CI/testing), then Expo's extra config
export const APPWRITE_PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID ||
  Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID ||
  "";
export const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ||
  Constants.expoConfig?.extra?.APPWRITE_DATABASE_ID ||
  "";
export const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT ||
  Constants.expoConfig?.extra?.APPWRITE_ENDPOINT ||
  "https://cloud.appwrite.io/v1";
export const APPWRITE_BUCKET_ID =
  process.env.APPWRITE_BUCKET_ID ||
  Constants.expoConfig?.extra?.APPWRITE_BUCKET_ID ||
  "";

// Define collection IDs for normalized database structure using environment variables
export const REPORTS_MAIN_COLLECTION_ID =
  process.env.APPWRITE_REPORTS_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORTS_COLLECTION_ID ||
  "reports_main";
export const REPORT_LOCATIONS_COLLECTION_ID =
  process.env.APPWRITE_REPORT_LOCATIONS_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_LOCATIONS_COLLECTION_ID ||
  "report_locations";
export const REPORT_METADATA_COLLECTION_ID =
  process.env.APPWRITE_REPORT_METADATA_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_METADATA_COLLECTION_ID ||
  "report_metadata";
export const REPORT_REPORTER_INFO_COLLECTION_ID =
  process.env.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID ||
  "report_reporter_info";
export const REPORT_SUSPECTS_COLLECTION_ID =
  process.env.APPWRITE_REPORT_SUSPECTS_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_SUSPECTS_COLLECTION_ID ||
  "report_suspects";
export const REPORT_VICTIMS_COLLECTION_ID =
  process.env.APPWRITE_REPORT_VICTIMS_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_VICTIMS_COLLECTION_ID ||
  "report_victims";
export const REPORT_WITNESSES_COLLECTION_ID =
  process.env.APPWRITE_REPORT_WITNESSES_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_WITNESSES_COLLECTION_ID ||
  "report_witnesses";
export const REPORT_MEDIA_COLLECTION_ID =
  process.env.APPWRITE_REPORT_MEDIA_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_REPORT_MEDIA_COLLECTION_ID ||
  "report_media";

// Legacy collection ID for backward compatibility (main reports collection)
export const REPORTS_COLLECTION_ID = REPORTS_MAIN_COLLECTION_ID;

// Check if project ID is missing and log a clear error message
if (!APPWRITE_PROJECT_ID) {
  console.error(
    "ERROR: Appwrite Project ID is not configured! Authentication will fail.",
  );
  console.error("Please set the APPWRITE_PROJECT_ID environment variable.");
}
if (!APPWRITE_DATABASE_ID) {
  console.error(
    "ERROR: Appwrite Database ID is not configured! Operations will fail.",
  );
  console.error("Please set the APPWRITE_DATABASE_ID environment variable.");
}
if (!REPORTS_MAIN_COLLECTION_ID) {
  console.error(
    "ERROR: Appwrite Main Reports Collection ID is not configured! Operations will fail.",
  );
  console.error(
    "Please set the APPWRITE_REPORTS_COLLECTION_ID environment variable.",
  );
}
if (!APPWRITE_BUCKET_ID) {
  console.error(
    "ERROR: Appwrite Bucket ID is not configured! File operations will fail.",
  );
  console.error("Please set the APPWRITE_BUCKET_ID environment variable.");
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID); // Use the environment variable

const account = new Account(client);
const databases = new Databases(client);

// Helper function to handle Appwrite operations with consistent error handling
const handleAppwriteOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  defaultReturn?: T,
): Promise<T> => {
  try {
    // Validate project ID before every operation
    // Re-check using Constants in case it wasn't available initially
    const currentProjectId =
      Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID || "";
    if (!currentProjectId) {
      throw new Error(
        "Appwrite Project ID is not configured. Please check app.config.js and .env.",
      );
    }

    const result = await operation();
    return result;
  } catch (error) {
    // Only log the error here if we are providing a default return value.
    // Otherwise, let the caller handle logging if it catches the re-thrown error.
    if (defaultReturn !== undefined) {
      console.error(`${operationName} error:`, error);
      return defaultReturn;
    }
    // If no defaultReturn is specified, just re-throw the error.
    throw error;
  }
};

// Auth functions
export const createAccount = async (
  email: string,
  password: string,
  name: string,
) => {
  return handleAppwriteOperation("Create account", () =>
    account.create(ID.unique(), email, password, name),
  );
};

export const signIn = async (email: string, password: string) => {
  return handleAppwriteOperation("Sign in", () =>
    account.createEmailPasswordSession(email, password),
  );
};

export const signOut = async () => {
  return handleAppwriteOperation(
    "Sign out",
    () => account.deleteSession("current"),
    true,
  );
};

export const getCurrentUser = async () => {
  return handleAppwriteOperation("Get current user", () => account.get(), null);
};

export const getCurrentSession = async () => {
  try {
    return await handleAppwriteOperation("Get current session", () =>
      account.getSession("current"),
    );
  } catch (error: any) {
    const isGuestScopeError =
      error?.type === "user_missing_scope" ||
      error?.message?.includes("User (role: guests) missing scope") ||
      error?.toString?.().includes("User (role: guests) missing scope");

    if (isGuestScopeError) {
      console.log(
        "getCurrentSession: Caught guest scope error. No active session found, returning null.",
      );
      return null;
    } else {
      console.error(
        "getCurrentSession encountered an unexpected error:",
        error,
      );
      throw error;
    }
  }
};

export const updateUserName = async (name: string) => {
  return handleAppwriteOperation("Update name", () => account.updateName(name));
};

export const updateUserEmail = async (email: string, password: string) => {
  return handleAppwriteOperation("Update email", () =>
    account.updateEmail(email, password),
  );
};

export const updateUserPhone = async (phone: string, password: string) => {
  return handleAppwriteOperation("Update phone", () =>
    account.updatePhone(phone, password),
  );
};

// Submit normalized report function (updated for normalized database structure)
export const submitNormalizedReport = async (formData: any) => {
  // Ensure all required IDs are present
  if (!APPWRITE_DATABASE_ID) {
    console.error("Database ID is not configured. Cannot submit report.");
    throw new Error("Database ID not configured for report submission.");
  }

  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    console.error("Could not get current user for report submission:", error);
  }

  try {
    // Generate unique report ID that will link all documents
    const reportId = ID.unique();
    const currentTime = new Date();

    // 1. Create main report document in reports_main collection
    const mainReportData = {
      incident_type: formData.incident_type || "",
      incident_date:
        formData.incident_date?.toISOString() || currentTime.toISOString(),
      reported_by: currentUser?.$id || "anonymous",
      status: formData.status || "pending",
    };

    const mainReportResponse = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      REPORTS_MAIN_COLLECTION_ID,
      reportId,
      mainReportData,
    );

    console.log("Main report created:", mainReportResponse);

    // 2. Create location document if location data exists
    if (formData.location) {
      const locationData = {
        report_id: reportId,
        location_address: formData.location.address || "",
        location_type: formData.location.type || "",
        location_details: formData.location.details || "",
        latitude: formData.location.latitude || 0.0,
        longitude: formData.location.longitude || 0.0,
      };

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        REPORT_LOCATIONS_COLLECTION_ID,
        ID.unique(),
        locationData,
      );
    }

    // 3. Create metadata document
    const metadataData = {
      report_id: reportId,
      incident_time:
        formData.incident_time?.toISOString() || currentTime.toISOString(),
      is_in_progress: formData.is_in_progress || false,
      description: formData.description || "",
      is_victim_reporter: formData.is_victim_reporter || false,
      created_at: currentTime.toISOString(),
      updated_at: currentTime.toISOString(),
      priority_level: formData.priority_level || "medium",
    };

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      REPORT_METADATA_COLLECTION_ID,
      ID.unique(),
      metadataData,
    );

    // 4. Create reporter info document if reporter data exists
    if (formData.reporter_info) {
      const reporterData = {
        report_id: reportId,
        reporter_name: formData.reporter_info.name || "",
        reporter_phone: formData.reporter_info.phone || "",
        reporter_email: formData.reporter_info.email || "",
      };

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        REPORT_REPORTER_INFO_COLLECTION_ID,
        ID.unique(),
        reporterData,
      );
    }

    // 5. Create victim documents
    if (formData.victims && formData.victims.length > 0) {
      for (const victim of formData.victims) {
        const victimData = {
          report_id: reportId,
          victim_name: victim.name || "",
          victim_contact: victim.contact || "",
        };

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          REPORT_VICTIMS_COLLECTION_ID,
          ID.unique(),
          victimData,
        );
      }
    }

    // 6. Create suspect documents
    if (formData.suspects && formData.suspects.length > 0) {
      for (const suspect of formData.suspects) {
        const suspectData = {
          report_id: reportId,
          suspect_description: suspect.description || "",
          suspect_vehicle: suspect.vehicle || "",
        };

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          REPORT_SUSPECTS_COLLECTION_ID,
          ID.unique(),
          suspectData,
        );
      }
    }

    // 7. Create witness documents
    if (formData.witnesses && formData.witnesses.length > 0) {
      for (const witness of formData.witnesses) {
        const witnessData = {
          report_id: reportId,
          witness_info: witness.info || "",
        };

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          REPORT_WITNESSES_COLLECTION_ID,
          ID.unique(),
          witnessData,
        );
      }
    }

    // 8. Create media documents
    if (formData.media && formData.media.length > 0) {
      for (const mediaItem of formData.media) {
        const mediaData = {
          report_id: reportId,
          file_id: mediaItem.file_id || "",
          media_type: mediaItem.media_type || "",
          file_name_original: mediaItem.file_name_original || "",
          display_order: mediaItem.display_order || 0,
        };

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          REPORT_MEDIA_COLLECTION_ID,
          ID.unique(),
          mediaData,
        );
      }
    }

    console.log("Normalized report submitted successfully with ID:", reportId);
    return {
      ...mainReportResponse,
      report_id: reportId,
    };
  } catch (error) {
    console.error("Error submitting report directly to Appwrite:", error);
    throw error;
  }
};

// Helper function to create a File object from a URI for Appwrite
export const createInputFileFromUrl = async (
  url: string,
  name: string,
  type: string,
): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch file from URI: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  return new File([blob], name, { type });
};

// Export the client and account for direct access if needed
export { client, account, databases };
