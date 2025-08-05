import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const SUSPECTS_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_REPORT_SUSPECTS_COLLECTION_ID;

const Suspects = () => {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSuspects = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SUSPECTS_COLLECTION_ID
      );
      console.log("Suspects report:", response.documents);
      setSuspects(response.documents);
    } catch (error) {
      console.error("Failed to fetch suspects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (suspectId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this suspect?"
    );
    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        SUSPECTS_COLLECTION_ID,
        suspectId
      );
      setSuspects((prev) =>
        prev.filter((suspect) => suspect.$id !== suspectId)
      );
    } catch (error) {
      console.error("Failed to delete suspect:", error);
    }
  };

  useEffect(() => {
    fetchSuspects();
  }, []);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/dashboard/reports")}
        className="mb-4 px-4 py-2 bg-gray-200 bg-gray-700 rounded hover:bg-gray-300 hover:bg-gray-600 text-gray-800 text-gray-200"
      >
        ← Back to Reports
      </button>

      <h1 className="text-2xl font-semibold mb-4 text-gray-900 text-white">
        Report Suspects
      </h1>

      {loading ? (
        <p className="text-gray-500 text-gray-400">Loading...</p>
      ) : suspects.length === 0 ? (
        <p className="text-gray-500 text-gray-400">No suspect records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white bg-gray-800 rounded shadow">
            <thead className="bg-gray-100 bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 text-gray-300">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 text-gray-300">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 text-gray-300">
                  Report ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {suspects.map((suspect) => (
                <tr
                  key={suspect.$id}
                  className="border-t border-gray-700 hover:bg-gray-50 hover:bg-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-800 text-gray-100">
                    {suspect.name || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-gray-300">
                    {suspect.status || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-gray-300">
                    {suspect.report_id || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(suspect.$id)}
                      className="text-red-600 hover:text-red-800 text-red-400 hover:text-red-300"
                      title="Delete Suspect"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Suspects;
