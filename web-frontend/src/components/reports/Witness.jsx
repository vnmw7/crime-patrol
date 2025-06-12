import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const WITNESSES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPORT_WITNESSES_COLLECTION_ID;

const Witnesses = () => {
  const [witnesses, setWitnesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWitnesses = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, WITNESSES_COLLECTION_ID);
      console.log("Witness report:", response.documents);
      setWitnesses(response.documents);
    } catch (error) {
      console.error("Failed to fetch witnesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (witnessId) => {
    const confirmDelete = confirm("Are you sure you want to delete this witness?");
    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(DATABASE_ID, WITNESSES_COLLECTION_ID, witnessId);
      setWitnesses((prev) => prev.filter((witness) => witness.$id !== witnessId));
    } catch (error) {
      console.error("Failed to delete witness:", error);
    }
  };

  useEffect(() => {
    fetchWitnesses();
  }, []);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/dashboard/reports")}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
      >
        ← Back to Reports
      </button>

      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Report Witnesses
      </h1>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : witnesses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No witness records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Witness Info</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Report ID</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {witnesses.map((witness) => (
                <tr key={witness.$id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                    {witness.witness_info || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {witness.report_id || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(witness.$id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Witness"
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

export default Witnesses;
