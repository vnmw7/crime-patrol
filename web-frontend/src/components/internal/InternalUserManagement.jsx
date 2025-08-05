import { useEffect, useState } from "react";
import { account, databases, Query } from "../../lib/appwrite";

const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const CONTACTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_CONTACTS_COLLECTION_ID;
const DOCUMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_DOCUMENTS_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

const ROLES = ["Moderator", "Investigator", "Read-Only Analyst"];

export default function InternalUserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Form for user main data
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    isVerified: false,
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    documentUrl: "",
    documentType: "",
  });

  // Contact editing state
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactEditForm, setContactEditForm] = useState({
    email: "",
    phone: "",
    address: "",
  });

  // Document editing state
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [documentEditForm, setDocumentEditForm] = useState({
    documentUrl: "",
    documentType: "",
    isVerified: false,
  });

  const isEditing = !!selectedUser;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchContacts(selectedUser.$id);
      fetchDocuments(selectedUser.$id);
      setForm({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        role: selectedUser.role || "",
        isVerified: selectedUser.isVerified || false,
        contactEmail: "", // Clear, since editing contact separately
        contactPhone: "",
        contactAddress: "",
        documentUrl: "",
        documentType: "",
      });

      setEditingContactId(null);
      setEditingDocumentId(null);
    } else {
      setContacts([]);
      setDocuments([]);
      resetForm();
      setEditingContactId(null);
      setEditingDocumentId(null);
    }
  }, [selectedUser]);

  async function fetchUsers() {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      setUsersList(res.documents);
    } catch (err) {
      alert("Failed to fetch users: " + err.message);
    }
  }

  async function fetchContacts(userId) {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        CONTACTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      setContacts(res.documents);
    } catch (err) {
      alert("Failed to fetch contacts: " + err.message);
    }
  }

  async function fetchDocuments(userId) {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      setDocuments(res.documents);
    } catch (err) {
      alert("Failed to fetch documents: " + err.message);
    }
  }

  function resetForm() {
    setForm({
      firstName: "",
      lastName: "",
      role: "",
      isVerified: false,
      contactEmail: "",
      contactPhone: "",
      contactAddress: "",
      documentUrl: "",
      documentType: "",
    });
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function selectUser(user) {
    setSelectedUser(user);
  }

  // Contact edit handlers
  function startEditContact(contact) {
    setEditingContactId(contact.$id);
    setContactEditForm({
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
    });
  }

  function cancelEditContact() {
    setEditingContactId(null);
  }

  function handleContactEditChange(e) {
    const { name, value } = e.target;
    setContactEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveContact() {
    if (!editingContactId) return;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        CONTACTS_COLLECTION_ID,
        editingContactId,
        {
          email: contactEditForm.email,
          phone: contactEditForm.phone,
          address: contactEditForm.address,
        }
      );
      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Updated contact ${contactEditForm.email}`,
        ...prev,
      ]);
      alert("Contact updated.");
      setEditingContactId(null);
      fetchContacts(selectedUser.$id);
    } catch (err) {
      alert("Failed to update contact: " + err.message);
    }
  }

  // Document edit handlers
  function startEditDocument(doc) {
    setEditingDocumentId(doc.$id);
    setDocumentEditForm({
      documentUrl: doc.documentUrl || "",
      documentType: doc.documentType || "",
      isVerified: !!doc.isVerified,
    });
  }

  function cancelEditDocument() {
    setEditingDocumentId(null);
  }

  function handleDocumentEditChange(e) {
    const { name, value, type, checked } = e.target;
    setDocumentEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveDocument() {
    if (!editingDocumentId) return;

    try {
      const currentUser = await account.get();

      await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        editingDocumentId,
        {
          documentUrl: documentEditForm.documentUrl,
          documentType: documentEditForm.documentType,
          isVerified: documentEditForm.isVerified,
          verifiedBy: currentUser.Email || currentUser.$id,
          verifiedAt: documentEditForm.isVerified
            ? new Date().toISOString()
            : null,
        }
      );

      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Updated document ${
          documentEditForm.documentUrl
        } by ${currentUser.email}`,
        ...prev,
      ]);

      alert("Document updated.");
      setEditingDocumentId(null);
      fetchDocuments(selectedUser.$id);
    } catch (err) {
      alert("Failed to update document: " + err.message);
    }
  }

  async function addUser() {
    if (!form.contactEmail) {
      alert("Contact Email is required to add a new user.");
      return;
    }

    try {
      // Check for duplicate contact email in contacts collection
      const existingContacts = await databases.listDocuments(
        DATABASE_ID,
        CONTACTS_COLLECTION_ID,
        [Query.equal("email", form.contactEmail)]
      );
      if (existingContacts.total > 0) {
        alert("A contact with this email already exists.");
        return;
      }

      // 1. Create user (without email)
      const newUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        "unique()",
        {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          isVerified: form.isVerified,
        }
      );

      // 2. Create contact (with email)
      await databases.createDocument(
        DATABASE_ID,
        CONTACTS_COLLECTION_ID,
        "unique()",
        {
          userId: newUser.$id,
          email: form.contactEmail,
          phone: form.contactPhone,
          address: form.contactAddress,
        }
      );

      // 3. Create document
      if (form.documentUrl && form.documentType) {
        await databases.createDocument(
          DATABASE_ID,
          DOCUMENTS_COLLECTION_ID,
          "unique()",
          {
            userId: newUser.$id,
            documentUrl: form.documentUrl,
            documentType: form.documentType,
            isVerified: false,
            uploadedAt: new Date().toISOString(),
            verifiedAt: new Date().toISOString(),
            verifiedBy: form.verifiedBy,
          }
        );
      }

      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Added user with contact email ${
          form.contactEmail
        }`,
        ...prev,
      ]);
      alert("User, contact, and document added.");
      fetchUsers();
      resetForm();
    } catch (err) {
      alert("Failed to add user and related data: " + err.message);
    }
  }
  async function saveUser() {
    if (!selectedUser) return;

    // Get user's email from contacts for audit log
    const userContacts = contacts.find(
      (contact) => contact.userId === selectedUser.$id
    );
    const userEmail = userContacts?.email || `User ID: ${selectedUser.$id}`;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        selectedUser.$id,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          isVerified: form.isVerified,
        }
      );

      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Updated user ${userEmail}`,
        ...prev,
      ]);
      alert("User saved.");
      fetchUsers();
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      alert("Error saving user: " + err.message);
    }
  }
  async function resetPassword() {
    if (!selectedUser) return;

    // Get user's email from contacts
    const userContacts = contacts.find(
      (contact) => contact.userId === selectedUser.$id
    );
    if (!userContacts || !userContacts.email) {
      alert("No email found for this user. Cannot reset password.");
      return;
    }

    try {
      await account.createRecovery(
        userContacts.email,
        "https://yourapp.com/reset-password"
      );
      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Password reset requested for ${
          userContacts.email
        }`,
        ...prev,
      ]);
      alert("Password reset email sent");
    } catch (err) {
      alert("Failed to reset password: " + err.message);
    }
  }
  async function deactivateUser() {
    if (!selectedUser) return;
    if (selectedUser.isVerified === false) {
      alert("User is already unverified.");
      return;
    }

    // Get user's email from contacts for audit log
    const userContacts = contacts.find(
      (contact) => contact.userId === selectedUser.$id
    );
    const userEmail = userContacts?.email || `User ID: ${selectedUser.$id}`;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        selectedUser.$id,
        {
          isVerified: false,
        }
      );
      setAuditLogs((prev) => [
        `${new Date().toISOString()}: Unverified user ${userEmail}`,
        ...prev,
      ]);
      alert("User marked as unverified.");
      fetchUsers();
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      alert("Failed to unverify user: " + err.message);
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl text-gray-50 font-bold">Internal User Management</h2>

      {/* User List */}
      <div className="border rounded-xl p-4 shadow max-h-96 overflow-y-auto text-gray-50">
        <h3 className="text-lg font-semibold mb-2 text-gray-50">Users List</h3>
        {usersList.length === 0 ? (
          <h2 className="text-white">No users found.</h2>
        ) : (
          <table className="w-full text-left text-sm ">
            <thead>
              <tr className="border-b font-medium text-gray-50">
                <th className="py-1 px-2">First Name</th>
                <th className="py-1 px-2">Last Name</th>
                <th className="py-1 px-2">Role</th>
                <th className="py-1 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr
                  key={user.$id}
                  className={`cursor-pointer hover:bg-blue-600 ${
                    selectedUser?.$id === user.$id ? "bg-blue-600" : ""
                  }`}
                  onClick={() => selectUser(user)}
                >
                  <td className="py-1 px-2 text-gray-50">{user.firstName}</td>
                  <td className="py-1 px-2 text-gray-50">{user.lastName}</td>
                  <td className="py-1 px-2 text-gray-50">{user.role}</td>
                  <td className="py-1 px-2 text-gray-50">
                    {user.isVerified ? "Verified" : "Unverified"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Detail Form */}
      <div className="border rounded-xl p-4 shadow max-w-6xl w-full text-gray-50">
        <h3 className="text-lg font-bold">
          {isEditing ? "Edit User" : "Add New User"}
        </h3>
        {/* Main user info inputs */}
        <div className="space-y-4 min-w-0 max-w-md text-gray-50">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Role</option>
            {ROLES.map((role) => (
              <option key={role} value={role} className="text-black">
                {role}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-gray-50">
            <input
              type="checkbox"
              name="isVerified"
              checked={form.isVerified}
              onChange={handleInputChange}
            />
            <span>Is Verified</span>
          </label>
        </div>
        {/* Add New User Contact and Document Inputs */}
        {!isEditing && (
          <div className="mt-6 max-w-md space-y-6 text-gray-50">
            {/* Contact inputs */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-50">Contact Info</h4>
              <input
                type="email"
                name="contactEmail"
                placeholder="Email"
                value={form.contactEmail}
                onChange={handleInputChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="text"
                name="contactPhone"
                placeholder="Phone"
                value={form.contactPhone}
                onChange={handleInputChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="text"
                name="contactAddress"
                placeholder="Address"
                value={form.contactAddress}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Document inputs */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-50">Document Info</h4>
              <input
                type="text"
                name="documentUrl"
                placeholder="Document URL"
                value={form.documentUrl}
                onChange={handleInputChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="text"
                name="documentType"
                placeholder="Document Type"
                value={form.documentType}
                onChange={handleInputChange}
                className="w-full border p-2 rounded mb-2"
              />
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={form.isVerified}
                  onChange={handleInputChange}
                />
                Is Verified
              </label>
            </div>
          </div>
        )}{" "}
        {/* Save/Cancel buttons */}
        <div className="mt-6 space-x-4 text-gray-50">
          {isEditing ? (
            <>
              <button
                onClick={saveUser}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save User
              </button>
              <button
                onClick={resetPassword}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Reset Password
              </button>
              <button
                onClick={deactivateUser}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Deactivate User
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addUser}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add User
            </button>
          )}
        </div>
      </div>

      {/* If editing user: show contacts and documents with editing */}
      {isEditing && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl text-gray-50">
          {/* Contacts */}
          <div className="border rounded-xl p-4 shadow max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-bold mb-3 text-gray-50">Contacts</h3>
            {contacts.length === 0 ? (
              <p>No contacts found for this user.</p>
            ) : (
              contacts.map((contact) =>
                editingContactId === contact.$id ? (
                  <div
                    key={contact.$id}
                    className="border p-3 rounded mb-2 flex flex-col space-y-2 text-gray-50"
                  >
                    <input
                      type="email"
                      name="email"
                      value={contactEditForm.email}
                      onChange={handleContactEditChange}
                      placeholder="Email"
                      className="border p-1 rounded"
                    />
                    <input
                      type="text"
                      name="phone"
                      value={contactEditForm.phone}
                      onChange={handleContactEditChange}
                      placeholder="Phone"
                      className="border p-1 rounded"
                    />
                    <input
                      type="text"
                      name="address"
                      value={contactEditForm.address}
                      onChange={handleContactEditChange}
                      placeholder="Address"
                      className="border p-1 rounded"
                    />
                    <div className="space-x-2">
                      <button
                        onClick={saveContact}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditContact}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={contact.$id}
                    className="border p-3 rounded mb-2 flex justify-between items-center text-gray-50"
                  >
                    <div>
                      <p className="text-white">
                        <strong className="text-white">Email:</strong>{" "}
                        <span className="text-white">{contact.email}</span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Phone:</strong>{" "}
                        <span className="text-white">{contact.phone}</span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Address:</strong>{" "}
                        <span className="text-white">{contact.address}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => startEditContact(contact)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                )
              )
            )}
          </div>

          {/* Documents */}
          <div className="border rounded-xl p-4 shadow max-h-[400px] overflow-y-auto text-gray-50">
            <h3 className="text-lg font-bold mb-3 text-gray-50">Documents</h3>
            {documents.length === 0 ? (
              <p>No documents found for this user.</p>
            ) : (
              documents.map((doc) =>
                editingDocumentId === doc.$id ? (
                  <div
                    key={doc.$id}
                    className="border p-3 rounded mb-2 flex flex-col space-y-2 text-gray-50"
                  >
                    <input
                      type="text"
                      name="documentUrl"
                      value={documentEditForm.documentUrl}
                      onChange={handleDocumentEditChange}
                      placeholder="Document URL"
                      className="border p-1 rounded"
                    />
                    <input
                      type="text"
                      name="documentType"
                      value={documentEditForm.documentType}
                      onChange={handleDocumentEditChange}
                      placeholder="Document Type"
                      className="border p-1 rounded"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={documentEditForm.isVerified}
                        onChange={handleDocumentEditChange}
                      />
                      <span>Is Verified</span>
                    </label>
                    <div className="space-x-2">
                      <button
                        onClick={saveDocument}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditDocument}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={doc.$id}
                    className="border p-3 rounded mb-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white">
                        <strong className="text-white">URL:</strong>{" "}
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white underline"
                        >
                          View Document
                        </a>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Type:</strong>{" "}
                        <span className="text-white">{doc.documentType}</span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Status:</strong>{" "}
                        <span className="text-white">
                          {doc.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Uploaded at:</strong>{" "}
                        <span className="text-white">{doc.uploadedAt}</span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Verified at:</strong>{" "}
                        <span className="text-white">{doc.verifiedAt}</span>
                      </p>
                      <p className="text-white">
                        <strong className="text-white">Verified by:</strong>{" "}
                        <span className="text-white">{doc.verifiedBy}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => startEditDocument(doc)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="mt-10 max-w-6xl">
        <h3 className="text-lg font-bold mb-2 text-white">Audit Logs</h3>
        <div className=" border rounded-xl p-3 max-h-48 overflow-y-auto text-xs font-mono whitespace-pre-line text-white">
          {auditLogs.length === 0 ? "No logs yet." : auditLogs.join("\n")}
        </div>
      </div>
    </div>
  );
}
