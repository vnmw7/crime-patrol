import { Account, Client, ID } from "appwrite";
import Constants from "expo-constants";

// Initialize Appwrite client
// Retrieve the project ID from Expo's extra config
const APPWRITE_PROJECT_ID =
  Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID || "";

// Check if project ID is missing and log a clear error message
if (!APPWRITE_PROJECT_ID) {
  console.error(
    "ERROR: Appwrite Project ID is not configured! Authentication will fail.",
  );
  console.error("Please set the APPWRITE_PROJECT_ID environment variable.");
}

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID); // Use the environment variable

const account = new Account(client);

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
    // Attempt to get the session using the helper.
    // IMPORTANT: Do NOT provide a defaultReturn value here in handleAppwriteOperation
    // We want the error to be thrown to this catch block if it occurs.
    return await handleAppwriteOperation("Get current session", () =>
      account.getSession("current"),
    );
  } catch (error: any) {
    // Check specifically for the guest scope error type or message
    const isGuestScopeError =
      error?.type === "user_missing_scope" ||
      error?.message?.includes("User (role: guests) missing scope") ||
      error?.toString?.().includes("User (role: guests) missing scope");

    if (isGuestScopeError) {
      // If it's the specific guest scope error, log it and return null
      console.log(
        "getCurrentSession: Caught guest scope error. No active session found, returning null.",
      );
      return null;
    } else {
      // For any other error, log it and re-throw it
      console.error(
        "getCurrentSession encountered an unexpected error:",
        error,
      );
      throw error; // Re-throw unexpected errors
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

// Export the client and account for direct access if needed
export { client, account };
