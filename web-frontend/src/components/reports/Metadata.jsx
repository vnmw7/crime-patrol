import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const METADATA_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPORT_METADATA_COLLECTION_ID;

const Metadata = () => {
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, METADATA_COLLECTION_ID);
      console.log("Metadata reports:", res.documents);
      setMetadata(res.documents);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMetadata = async (id) => {
    if (!confirm("Are you sure you want to delete this metadata record?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, METADATA_COLLECTION_ID, id);
      setMetadata((prev) => prev.filter((item) => item.$id !== id));
    } catch (err) {
      console.error("Error deleting metadata:", err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/dashboard/reports")}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
      >
        ← Back to Reports
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Report Metadata
      </h1>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <p className="p-4 text-gray-500 dark:text-gray-300">Loading...</p>
        ) : metadata.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-300">No metadata found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Report ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {metadata.map((item) => (
                <tr key={item.$id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.key || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.value || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.report_id || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteMetadata(item.$id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Metadata;
