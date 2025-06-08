const express = require("express");
const router = express.Router();

const {
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
} = require("../services/userServices");

/**
 * POST /api/users
 * Create a new user with optional contact information
 */
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      role = "citizen",
      isVerified = false,
      email,
      phone,
      address,
      idPictureUrl,
      documentType = "id_card",
      documentVerified = false,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["firstName", "lastName"],
      });
    }

    // Validate role
    const validRoles = ["citizen", "police", "admin", "emergency_responder"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        validRoles,
      });
    }
    const result = await createCompleteUser({
      firstName,
      lastName,
      role,
      isVerified,
      email,
      phone,
      address,
      idPictureUrl,
      documentType,
      documentVerified,
    });

    res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
});

/**
 * GET /api/users
 * Get all users with optional filtering
 */
router.get("/", async (req, res) => {
  try {
    const {
      limit = 50,
      role,
      isVerified,
      includeContacts = "false",
      includeDocuments = "false",
    } = req.query;

    const options = {
      limit: parseInt(limit),
      includeContacts: includeContacts === "true",
      includeDocuments: includeDocuments === "true",
    };

    if (role) {
      options.role = role;
    }

    if (isVerified !== undefined) {
      options.isVerified = isVerified === "true";
    }

    const users = await getUsers(options);

    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user by ID with contact information
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getUserById(id);

    res.json({
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "User not found",
        userId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
});

/**
 * GET /api/users/email/:email
 * Find user by email address
 */
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await findUserByEmail(email);

    if (!result) {
      return res.status(404).json({
        error: "User not found",
        email,
      });
    }

    res.json({
      message: "User found successfully",
      data: result,
    });
  } catch (error) {
    console.error(`Error finding user by email ${req.params.email}:`, error);
    res.status(500).json({
      error: "Failed to find user",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/users/:id
 * Update user information
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove contact and document fields from user update
    const {
      email,
      phone,
      address,
      idPictureUrl,
      documentType,
      documentVerified,
      verifiedBy,
      ...userUpdateData
    } = updateData;
    let updatedUser = null;
    let updatedContact = null;
    let updatedDocument = null;

    // Update user information if there are user fields
    if (Object.keys(userUpdateData).length > 0) {
      // Validate role if being updated
      if (userUpdateData.role) {
        const validRoles = [
          "citizen",
          "police",
          "admin",
          "emergency_responder",
        ];
        if (!validRoles.includes(userUpdateData.role)) {
          return res.status(400).json({
            error: "Invalid role",
            validRoles,
          });
        }
      }

      updatedUser = await updateUser(id, userUpdateData);
    }

    // Update contact information if there are contact fields
    if (email !== undefined || phone !== undefined || address !== undefined) {
      const contactUpdateData = {};
      if (email !== undefined) contactUpdateData.email = email;
      if (phone !== undefined) contactUpdateData.phone = phone;
      if (address !== undefined) contactUpdateData.address = address;

      updatedContact = await updateUserContact(id, contactUpdateData);
    }

    // Update document information if there are document fields
    if (
      idPictureUrl !== undefined ||
      documentType !== undefined ||
      documentVerified !== undefined
    ) {
      const documentUpdateData = {};
      if (idPictureUrl !== undefined)
        documentUpdateData.idPictureUrl = idPictureUrl;
      if (documentType !== undefined)
        documentUpdateData.documentType = documentType;
      if (documentVerified !== undefined)
        documentUpdateData.isVerified = documentVerified;
      if (verifiedBy !== undefined) {
        documentUpdateData.verifiedBy = verifiedBy;
        if (documentVerified) {
          documentUpdateData.verifiedAt = new Date().toISOString();
        }
      }

      updatedDocument = await updateUserDocument(id, documentUpdateData);
    }

    res.json({
      message: "User updated successfully",
      data: {
        user: updatedUser,
        contact: updatedContact,
        document: updatedDocument,
      },
    });
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "User not found",
        userId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to update user",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/users/:id/verify
 * Toggle user verification status
 */
router.patch("/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        error: "isVerified must be a boolean value",
      });
    }

    const updatedUser = await updateUser(id, { isVerified });

    res.json({
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      `Error updating verification for user ${req.params.id}:`,
      error
    );

    if (error.code === 404) {
      return res.status(404).json({
        error: "User not found",
        userId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to update user verification",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user and associated contact information
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await deleteUser(id);

    res.json({
      message: "User deleted successfully",
      userId: id,
    });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "User not found",
        userId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to delete user",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/users/:id/document/verify
 * Verify user document
 */
router.patch("/:id/document/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verifiedBy } = req.body;

    if (!verifiedBy) {
      return res.status(400).json({
        error: "verifiedBy is required",
      });
    }

    const updatedDocument = await verifyUserDocument(id, verifiedBy);

    res.json({
      message: "User document verified successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error(`Error verifying document for user ${req.params.id}:`, error);

    if (error.code === 404) {
      return res.status(404).json({
        error: "User or document not found",
        userId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to verify user document",
      details: error.message,
    });
  }
});

/**
 * GET /api/users/documents/pending
 * Get users with pending document verification
 */
router.get("/documents/pending", async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const usersWithPendingDocs = await getUsersWithPendingDocuments({
      limit: parseInt(limit),
    });

    res.json({
      message: "Users with pending documents retrieved successfully",
      count: usersWithPendingDocs.length,
      data: usersWithPendingDocs,
    });
  } catch (error) {
    console.error("Error fetching users with pending documents:", error);
    res.status(500).json({
      error: "Failed to fetch users with pending documents",
      details: error.message,
    });
  }
});

/**
 * GET /api/users/role/:role
 * Get users by role
 */
router.get("/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const {
      limit = 50,
      includeContacts = "false",
      includeDocuments = "false",
    } = req.query;

    const validRoles = ["citizen", "police", "admin", "emergency_responder"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        validRoles,
      });
    }
    const users = await getUsers({
      role,
      limit: parseInt(limit),
      includeContacts: includeContacts === "true",
      includeDocuments: includeDocuments === "true",
    });

    res.json({
      message: `Users with role '${role}' retrieved successfully`,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(`Error fetching users by role ${req.params.role}:`, error);
    res.status(500).json({
      error: "Failed to fetch users by role",
      details: error.message,
    });
  }
});

/**
 * GET /api/users/verified/:status
 * Get users by verification status
 */
router.get("/verified/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const {
      limit = 50,
      includeContacts = "false",
      includeDocuments = "false",
    } = req.query;

    if (status !== "true" && status !== "false") {
      return res.status(400).json({
        error: "Invalid verification status",
        validValues: ["true", "false"],
      });
    }
    const users = await getUsers({
      isVerified: status === "true",
      limit: parseInt(limit),
      includeContacts: includeContacts === "true",
      includeDocuments: includeDocuments === "true",
    });

    res.json({
      message: `${
        status === "true" ? "Verified" : "Unverified"
      } users retrieved successfully`,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(
      `Error fetching users by verification status ${req.params.status}:`,
      error
    );
    res.status(500).json({
      error: "Failed to fetch users by verification status",
      details: error.message,
    });
  }
});

module.exports = router;
