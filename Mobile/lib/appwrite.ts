import { Account, Client, ID, Databases, Permission, Role } from "appwrite";
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
export const APPWRITE_COLLECTION_ID =
  process.env.APPWRITE_COLLECTION_ID ||
  Constants.expoConfig?.extra?.APPWRITE_COLLECTION_ID ||
  "";
export const APPWRITE_BUCKET_ID =
  process.env.APPWRITE_BUCKET_ID || // Corrected this line
  Constants.expoConfig?.extra?.APPWRITE_BUCKET_ID || // Corrected this line
  "";

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
if (!APPWRITE_COLLECTION_ID) {
  console.error(
    "ERROR: Appwrite Collection ID is not configured! Operations will fail.",
  );
  console.error("Please set the APPWRITE_COLLECTION_ID environment variable.");
}
if (!APPWRITE_BUCKET_ID) {
  console.error(
    "ERROR: Appwrite Bucket ID is not configured! File operations will fail.",
  );
  console.error("Please set the APPWRITE_BUCKET_ID environment variable.");
}

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
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

// Submit report function
export const submitReport = async (formData: any) => {
  // Ensure all required IDs are present
  if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
    console.error(
      "Database ID or Collection ID is not configured. Cannot submit report.",
    );
    throw new Error(
      "Database or Collection ID not configured for report submission.",
    );
  }

  // Get the current user to add as reported_by
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    console.error("Could not get current user for report submission:", error);
    // Continue without user info, as the report is still valuable
  }

  // Prepare the data for Appwrite
  // If Media_Attachments contains Appwrite file IDs, you might want to store those directly
  // or store the full objects if they contain other useful metadata for your app.
  const reportDataToSave = {
    ...formData,
    // If you only want to store file IDs:
    // Media_Attachments: formData.Media_Attachments
    //   ? formData.Media_Attachments.map((media: any) => media.appwrite_file_id)
    //   : [],
    // If you want to store the full media attachment objects (as currently structured):
    Media_Attachments: formData.Media_Attachments || [],
    // Add the user ID who reported the incident
    reported_by: currentUser?.$id || null,
  };

  return handleAppwriteOperation("Submit report", () =>
    databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      ID.unique(),
      reportDataToSave,
      [
        Permission.read(Role.any()), // Example: Allow any user to read (adjust as needed)
        Permission.update(Role.users()), // Example: Allow authenticated users to update
        Permission.delete(Role.users()), // Example: Allow authenticated users to delete
      ],
    ),
  );
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
