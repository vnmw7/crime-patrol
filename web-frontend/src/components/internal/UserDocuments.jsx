import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_DOCUMENTS_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export default function UserDocuments() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    documentUrl: "",
    documentType: "",
    isVerified: false,
    uploadedAt: new Date().toISOString(),
    verifiedAt: "",
    verifiedBy: "",
    userId: "",
  });

  const navigate = useNavigate(); // 🧭 navigation hook

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      setDocuments(res.documents);
    } catch (err) {
      alert("Failed to fetch documents: " + err.message);
    }
  }

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function addDocument() {
    try {
      const payload = {
        ...form,
        uploadedAt: new Date().toISOString(),
        verifiedAt: form.isVerified ? new Date().toISOString() : null,
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", payload);
      alert("Document added.");
      setForm({
        documentUrl: "",
        documentType: "",
        isVerified: false,
        uploadedAt: new Date().toISOString(),
        verifiedAt: "",
        verifiedBy: "",
        userId: "",
      });
      fetchDocuments();
    } catch (err) {
      alert("Error adding document: " + err.message);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/dashboard/internal-users")}
        className="text-sm"
      >
        ← Return
      </button>

      <h2 className="text-xl font-bold">User Documents</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="documentUrl"
          placeholder="Document URL"
          value={form.documentUrl}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          name="documentType"
          placeholder="Document Type"
          value={form.documentType}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="verifiedBy"
          placeholder="Verified By"
          value={form.verifiedBy}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <label className="flex items-center col-span-2 space-x-2">
          <input
            type="checkbox"
            name="isVerified"
            checked={form.isVerified}
            onChange={handleChange}
          />
          <span>Is Verified</span>
        </label>
      </div>

      <button
        onClick={addDocument}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Document
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Saved Documents</h3>
        {documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.$id} className="border p-2 rounded text-sm">
                <p><strong>Document URL:</strong> <a href={doc.documentUrl} className="text-blue-600 underline" target="_blank">{doc.documentUrl}</a></p>
                <p><strong>Type:</strong> {doc.documentType}</p>
                <p><strong>Verified:</strong> {doc.isVerified ? "Yes" : "No"}</p>
                <p><strong>Uploaded At:</strong> {new Date(doc.uploadedAt).toLocaleString()}</p>
                {doc.verifiedAt && <p><strong>Verified At:</strong> {new Date(doc.verifiedAt).toLocaleString()}</p>}
                <p><strong>Verified By:</strong> {doc.verifiedBy}</p>
                <p><strong>User ID:</strong> {doc.userId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
