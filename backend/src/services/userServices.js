const {
  Client,
  Databases,
  ID,
  Query,
  Permission,
  Role,
} = require("node-appwrite");
const {
  DATABASE_ID,
  NORMALIZED_COLLECTIONS,
} = require("../config/appwriteConfig");

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const USERS_COLLECTION_ID = NORMALIZED_COLLECTIONS.USERS.id;
const USERS_COLLECTION_NAME = NORMALIZED_COLLECTIONS.USERS.name;
const USER_CONTACTS_COLLECTION_ID = NORMALIZED_COLLECTIONS.USER_CONTACTS.id;
const USER_CONTACTS_COLLECTION_NAME = NORMALIZED_COLLECTIONS.USER_CONTACTS.name;
const USER_DOCUMENTS_COLLECTION_ID = NORMALIZED_COLLECTIONS.USER_DOCUMENTS.id;
const USER_DOCUMENTS_COLLECTION_NAME =
  NORMALIZED_COLLECTIONS.USER_DOCUMENTS.name;

/**
 * Setup users collection in Appwrite
 */
async function setupUsersCollection() {
  try {
    console.log("Setting up users collection...");

    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
      console.log("Users collection already exists");
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
      console.log("Creating users collection...");

      // Create the collection
      await databases.createCollection(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        USERS_COLLECTION_NAME,
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
        false, // not document security
        true // enabled
      );

      // Create attributes
      const attributes = [
        { key: "firstName", type: "string", size: 255, required: true },
        { key: "lastName", type: "string", size: 255, required: true },
        { key: "role", type: "string", size: 100, required: true },
        { key: "isVerified", type: "boolean", required: true },
      ];

      for (const attr of attributes) {
        console.log(`Creating attribute: ${attr.key}`);
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            attr.key,
            attr.required
          );
        }

        // Wait a bit between attribute creations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Create indexes for better query performance
      console.log("Creating indexes for users collection...");

      // Index for role queries
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        "role_index",
        "key",
        ["role"]
      );

      // Index for verification status
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        "verified_index",
        "key",
        ["isVerified"]
      );

      // Index for full name searches
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        "name_index",
        "key",
        ["firstName", "lastName"]
      );
    }

    console.log("Users collection setup completed successfully");
  } catch (error) {
    console.error("Error setting up users collection:", error);
    throw error;
  }
}

/**
 * Setup user contacts collection in Appwrite
 */
async function setupUserContactsCollection() {
  try {
    console.log("Setting up user contacts collection...");

    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, USER_CONTACTS_COLLECTION_ID);
      console.log("User contacts collection already exists");
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
      console.log("Creating user contacts collection...");

      // Create the collection
      await databases.createCollection(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        USER_CONTACTS_COLLECTION_NAME,
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
        false, // not document security
        true // enabled
      );

      // Create attributes
      const attributes = [
        { key: "email", type: "string", size: 255, required: false },
        { key: "phone", type: "string", size: 50, required: false },
        { key: "address", type: "string", size: 500, required: false },
        { key: "userId", type: "string", size: 255, required: true },
      ];

      for (const attr of attributes) {
        console.log(`Creating attribute: ${attr.key}`);
        await databases.createStringAttribute(
          DATABASE_ID,
          USER_CONTACTS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );

        // Wait a bit between attribute creations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Create indexes for better query performance
      console.log("Creating indexes for user contacts collection...");

      // Index for userId queries (most important for linking)
      await databases.createIndex(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        "userId_index",
        "key",
        ["userId"]
      );

      // Index for email queries
      await databases.createIndex(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        "email_index",
        "key",
        ["email"]
      );

      // Index for phone queries
      await databases.createIndex(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        "phone_index",
        "key",
        ["phone"]
      );
    }

    console.log("User contacts collection setup completed successfully");
  } catch (error) {
    console.error("Error setting up user contacts collection:", error);
    throw error;
  }
}

/**
 * Setup user documents collection in Appwrite
 */
async function setupUserDocumentsCollection() {
  try {
    console.log("Setting up user documents collection...");

    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, USER_DOCUMENTS_COLLECTION_ID);
      console.log("User documents collection already exists");
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
      console.log("Creating user documents collection...");

      // Create the collection
      await databases.createCollection(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        USER_DOCUMENTS_COLLECTION_NAME,
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
        false, // not document security
        true // enabled
      );

      // Create attributes
      const attributes = [
        { key: "documentUrl", type: "string", size: 500, required: true },
        { key: "documentType", type: "string", size: 100, required: true },
        { key: "isVerified", type: "boolean", required: true },
        { key: "uploadedAt", type: "datetime", required: true },
        { key: "verifiedAt", type: "datetime", required: false },
        { key: "verifiedBy", type: "string", size: 255, required: false },
        { key: "userId", type: "string", size: 255, required: true },
      ];

      for (const attr of attributes) {
        console.log(`Creating attribute: ${attr.key}`);
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            USER_DOCUMENTS_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            USER_DOCUMENTS_COLLECTION_ID,
            attr.key,
            attr.required
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            USER_DOCUMENTS_COLLECTION_ID,
            attr.key,
            attr.required
          );
        }

        // Wait a bit between attribute creations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Create indexes for better query performance
      console.log("Creating indexes for user documents collection...");

      // Index for userId queries (most important for linking)
      await databases.createIndex(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        "userId_index",
        "key",
        ["userId"]
      );

      // Index for document type queries
      await databases.createIndex(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        "documentType_index",
        "key",
        ["documentType"]
      );

      // Index for verification status
      await databases.createIndex(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        "verified_index",
        "key",
        ["isVerified"]
      );

      // Index for upload date
      await databases.createIndex(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        "uploadedAt_index",
        "key",
        ["uploadedAt"]
      );
    }

    console.log("User documents collection setup completed successfully");
  } catch (error) {
    console.error("Error setting up user documents collection:", error);
    throw error;
  }
}

/**
 * Setup both user collections
 */
async function setupUserCollections() {
  try {
    await setupUsersCollection();
    await setupUserContactsCollection();
    await setupUserDocumentsCollection();
    console.log("All user collections setup completed successfully");
  } catch (error) {
    console.error("Error setting up user collections:", error);
    throw error;
  }
}

/**
 * Create a new user record
 */
async function createUser(userData) {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || "citizen",
        isVerified: userData.isVerified || false,
      }
    );

    console.log(`User created with ID: ${document.$id}`);
    return document;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Create user contact information
 */
async function createUserContact(contactData) {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      USER_CONTACTS_COLLECTION_ID,
      ID.unique(),
      {
        email: contactData.email || null,
        phone: contactData.phone || null,
        address: contactData.address || null,
        userId: contactData.userId,
      }
    );

    console.log(`User contact created with ID: ${document.$id}`);
    return document;
  } catch (error) {
    console.error("Error creating user contact:", error);
    throw error;
  }
}

/**
 * Create user document information
 */
async function createUserDocument(documentData) {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      USER_DOCUMENTS_COLLECTION_ID,
      ID.unique(),
      {
        idPictureUrl: documentData.idPictureUrl,
        documentType: documentData.documentType || "id_card",
        isVerified: documentData.isVerified || false,
        uploadedAt: documentData.uploadedAt || new Date().toISOString(),
        verifiedAt: documentData.verifiedAt || null,
        verifiedBy: documentData.verifiedBy || null,
        userId: documentData.userId,
      }
    );

    console.log(`User document created with ID: ${document.$id}`);
    return document;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
}

/**
 * Create a complete user with contact and document information
 */
async function createCompleteUser(userData) {
  try {
    // Create the user first
    const user = await createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isVerified: userData.isVerified,
    });

    // Create contact information if provided
    let userContact = null;
    if (userData.email || userData.phone || userData.address) {
      userContact = await createUserContact({
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        userId: user.$id,
      });
    }

    // Create document information if provided
    let userDocument = null;
    if (userData.idPictureUrl) {
      userDocument = await createUserDocument({
        idPictureUrl: userData.idPictureUrl,
        documentType: userData.documentType,
        isVerified: userData.documentVerified,
        userId: user.$id,
      });
    }

    return {
      user,
      contact: userContact,
      document: userDocument,
    };
  } catch (error) {
    console.error("Error creating complete user:", error);
    throw error;
  }
}

/**
 * Get user by ID with contact and document information
 */
async function getUserById(userId) {
  try {
    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    // Get contact information
    let contact = null;
    try {
      const contacts = await databases.listDocuments(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      contact = contacts.documents[0] || null;
    } catch (error) {
      console.log("No contact information found for user:", userId);
    }

    // Get document information
    let document = null;
    try {
      const documents = await databases.listDocuments(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      document = documents.documents[0] || null;
    } catch (error) {
      console.log("No document information found for user:", userId);
    }

    return {
      user,
      contact,
      document,
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get users with filtering options
 */
async function getUsers(options = {}) {
  try {
    const {
      limit = 50,
      role,
      isVerified,
      includeContacts = false,
      includeDocuments = false,
    } = options;

    let queries = [Query.limit(limit), Query.orderDesc("$createdAt")];

    // Add role filter if provided
    if (role) {
      queries.push(Query.equal("role", role));
    }

    // Add verification filter if provided
    if (typeof isVerified === "boolean") {
      queries.push(Query.equal("isVerified", isVerified));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      queries
    );

    const users = response.documents;

    // Include contact information if requested
    if (includeContacts) {
      for (let user of users) {
        try {
          const contacts = await databases.listDocuments(
            DATABASE_ID,
            USER_CONTACTS_COLLECTION_ID,
            [Query.equal("userId", user.$id)]
          );
          user.contact = contacts.documents[0] || null;
        } catch (error) {
          user.contact = null;
        }
      }
    }

    // Include document information if requested
    if (includeDocuments) {
      for (let user of users) {
        try {
          const documents = await databases.listDocuments(
            DATABASE_ID,
            USER_DOCUMENTS_COLLECTION_ID,
            [Query.equal("userId", user.$id)]
          );
          user.document = documents.documents[0] || null;
        } catch (error) {
          user.document = null;
        }
      }
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Update user information
 */
async function updateUser(userId, updateData) {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      updateData
    );

    console.log(`User ${userId} updated successfully`);
    return document;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user contact information
 */
async function updateUserContact(userId, contactData) {
  try {
    // Find existing contact
    const contacts = await databases.listDocuments(
      DATABASE_ID,
      USER_CONTACTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (contacts.documents.length > 0) {
      // Update existing contact
      const document = await databases.updateDocument(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        contacts.documents[0].$id,
        contactData
      );
      console.log(`User contact for ${userId} updated successfully`);
      return document;
    } else {
      // Create new contact
      const document = await createUserContact({
        ...contactData,
        userId,
      });
      console.log(`New user contact created for ${userId}`);
      return document;
    }
  } catch (error) {
    console.error(`Error updating user contact for ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user document information
 */
async function updateUserDocument(userId, documentData) {
  try {
    // Find existing document
    const documents = await databases.listDocuments(
      DATABASE_ID,
      USER_DOCUMENTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (documents.documents.length > 0) {
      // Update existing document
      const document = await databases.updateDocument(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        documents.documents[0].$id,
        documentData
      );
      console.log(`User document for ${userId} updated successfully`);
      return document;
    } else {
      // Create new document
      const document = await createUserDocument({
        ...documentData,
        userId,
      });
      console.log(`New user document created for ${userId}`);
      return document;
    }
  } catch (error) {
    console.error(`Error updating user document for ${userId}:`, error);
    throw error;
  }
}

/**
 * Verify user document
 */
async function verifyUserDocument(userId, verifiedBy) {
  try {
    const updateData = {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy,
    };

    const document = await updateUserDocument(userId, updateData);
    console.log(`User document for ${userId} verified by ${verifiedBy}`);
    return document;
  } catch (error) {
    console.error(`Error verifying user document for ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete user and associated contact and document information
 */
async function deleteUser(userId) {
  try {
    // Delete contact information first
    const contacts = await databases.listDocuments(
      DATABASE_ID,
      USER_CONTACTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    for (const contact of contacts.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        USER_CONTACTS_COLLECTION_ID,
        contact.$id
      );
    }

    // Delete document information
    const documents = await databases.listDocuments(
      DATABASE_ID,
      USER_DOCUMENTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    for (const document of documents.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        USER_DOCUMENTS_COLLECTION_ID,
        document.$id
      );
    }

    // Delete the user
    await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);

    console.log(
      `User ${userId} and associated contacts and documents deleted successfully`
    );
    return true;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  try {
    // Find contact with this email
    const contacts = await databases.listDocuments(
      DATABASE_ID,
      USER_CONTACTS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (contacts.documents.length === 0) {
      return null;
    }

    // Get the user
    const userId = contacts.documents[0].userId;
    return await getUserById(userId);
  } catch (error) {
    console.error(`Error finding user by email ${email}:`, error);
    throw error;
  }
}

/**
 * Get users with pending document verification
 */
async function getUsersWithPendingDocuments(options = {}) {
  try {
    const { limit = 50 } = options;

    // Get all unverified documents
    const documents = await databases.listDocuments(
      DATABASE_ID,
      USER_DOCUMENTS_COLLECTION_ID,
      [
        Query.equal("isVerified", false),
        Query.limit(limit),
        Query.orderDesc("uploadedAt"),
      ]
    );

    // Get user information for each document
    const usersWithPendingDocs = [];
    for (const doc of documents.documents) {
      try {
        const userResult = await getUserById(doc.userId);
        usersWithPendingDocs.push({
          ...userResult,
          pendingDocument: doc,
        });
      } catch (error) {
        console.log(`Could not fetch user ${doc.userId} for pending document`);
      }
    }

    return usersWithPendingDocs;
  } catch (error) {
    console.error("Error fetching users with pending documents:", error);
    throw error;
  }
}

module.exports = {
  setupUserCollections,
  setupUsersCollection,
  setupUserContactsCollection,
  setupUserDocumentsCollection,
  createUser,
  createUserContact,
  createUserDocument,
  createCompleteUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserContact,
  updateUserDocument,
  verifyUserDocument,
  deleteUser,
  findUserByEmail,
  getUsersWithPendingDocuments,
};
