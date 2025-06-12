import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_CONTACTS_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export default function UserContacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    address: "",
    userId: "",
  });

  const navigate = useNavigate(); // 🧭 navigation hook

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      setContacts(res.documents);
      console.log("Fetched contacts:", res.documents);
    } catch (err) {
      alert("Failed to fetch contacts: " + err.message);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function addContact() {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", form);
      alert("Contact added.");
      setForm({ email: "", phone: "", address: "", userId: "" });
      fetchContacts();
    } catch (err) {
      alert("Error adding contact: " + err.message);
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

      <h2 className="text-xl font-bold">User Contacts</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
      </div>

      <button
        onClick={addContact}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Contact
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Saved Contacts</h3>
        {contacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          <ul className="space-y-2">
            {contacts.map((contact) => (
              <li key={contact.$id} className="border p-2 rounded">
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Phone:</strong> {contact.phone}</p>
                <p><strong>Address:</strong> {contact.address}</p>
                <p><strong>User ID:</strong> {contact.userId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
