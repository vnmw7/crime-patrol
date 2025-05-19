
import { Client, Account, AppwriteException } from 'appwrite';

// Ensure these environment variables are set in your deployment environment
// or a .env file for local development (using something like dotenv)
// You can find these in your Appwrite project settings
const appwriteEndpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'; // Default to cloud if not set
const appwriteProjectId = process.env.VITE_APPWRITE_PROJECT_ID || 'YOUR_APPWRITE_PROJECT_ID'; // Replace with your Appwrite project ID

if (!appwriteEndpoint || appwriteEndpoint === 'YOUR_APPWRITE_ENDPOINT') {
  console.warn('Appwrite endpoint is not configured. Please set VITE_APPWRITE_ENDPOINT environment variable.');
}

if (!appwriteProjectId || appwriteProjectId === 'YOUR_APPWRITE_PROJECT_ID') {
  console.warn('Appwrite project ID is not configured. Please set VITE_APPWRITE_PROJECT_ID environment variable.');
}

const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

const account = new Account(client);

// --- Authentication Functions ---

/**
 * Creates a new user account.
 * @param email User's email
 * @param password User's password (min 8 chars)
 * @param name User's name (optional)
 * @returns {Promise<Models.User<Models.Preferences>>} The newly created user object.
 */
export const createAccount = async (email, password, name) => {
    try {
        // Appwrite requires a unique ID for each user. 'unique()' lets Appwrite generate one.
        const newUser = await account.create('unique()', email, password, name);
        return newUser;
    } catch (error) {
        console.error('Appwrite account creation error:', error);
        if (error instanceof AppwriteException) {
             if (error.code === 409) { // User already exists
                throw new Error('An account with this email already exists.');
            } else if (error.code === 400) { // Invalid input (e.g., weak password)
                 throw new Error(error.message || 'Invalid input for account creation. Ensure password meets requirements.');
            }
        }
        throw new Error('An unexpected error occurred during account creation.');
    }
};

/**
 * Signs in a user using email and password.
 * @param email User's email
 * @param password User's password
 * @returns {Promise<Models.Session>} The session object upon successful login.
 */
export const signIn = async (email, password) => {
  try {
    // Creates a session, effectively logging the user in.
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error('Appwrite sign-in error:', error);
     if (error instanceof AppwriteException) {
        if (error.code === 401) { // Unauthorized
            throw new Error('Invalid email or password.');
        } else if (error.code === 429) { // Too many requests
            throw new Error('Too many login attempts. Please try again later.');
        } else if (error.code === 400) { // Bad request (e.g., missing fields server-side, though unlikely here)
             throw new Error(error.message || 'Invalid request during sign-in.');
        }
    }
    throw new Error('An unexpected error occurred during sign-in.');
  }
};


/**
 * Gets the currently active session.
 * Note: In Remix server-side actions/loaders, managing sessions requires handling cookies/tokens.
 * This function is more straightforward client-side. Server-side might need adaptation.
 * @returns {Promise<Models.Session | null>} The current session object or null if not logged in.
 */
export const getCurrentSession = async () => {
    try {
        // Retrieves the session details for the currently logged-in user.
        const session = await account.getSession('current');
        return session;
    } catch (error) {
        // Appwrite throws an error if no session exists
        return null;
    }
};

/**
 * Logs out the current user by deleting the active session.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    try {
        // Deletes the current session, effectively logging the user out.
        await account.deleteSession('current');
    } catch (error) {
        console.error('Appwrite sign-out error:', error);
        throw new Error('Failed to sign out.');
    }
};

// Export the configured client and account instance if needed elsewhere
export { client, account };
