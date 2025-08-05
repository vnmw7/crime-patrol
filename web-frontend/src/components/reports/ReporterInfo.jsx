import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const REPORTER_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID;

const ReporterInfo = () => {
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReporters = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REPORTER_COLLECTION_ID
      );
      console.log("Report Info:", response.documents);
      setReporters(response.documents);
    } catch (error) {
      console.error("Failed to fetch reporter info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reporterId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this reporter?"
    );
    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        REPORTER_COLLECTION_ID,
        reporterId
      );
      setReporters((prev) =>
        prev.filter((reporter) => reporter.$id !== reporterId)
      );
    } catch (error) {
      console.error("Failed to delete reporter:", error);
    }
  };

  useEffect(() => {
    fetchReporters();
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
        Reporter Information
      </h1>

      {loading ? (
        <p className="text-gray-500 text-gray-400">Loading...</p>
      ) : reporters.length === 0 ? (
        <p className="text-gray-500 text-gray-400">No reporter info found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white bg-gray-800 rounded shadow">
            <thead className="bg-gray-100 bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-100 text-gray-100">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-100 text-gray-100">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-100 text-gray-100">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-100 text-gray-100">
                  Report ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-100 text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reporters.map((reporter) => (
                <tr
                  key={reporter.$id}
                  className="border-t border-gray-700 hover:bg-gray-50 hover:bg-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-800 text-gray-100">
                    {reporter.name || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-gray-300">
                    {reporter.phone || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-gray-300">
                    {reporter.email || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-gray-300">
                    {reporter.report_id || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(reporter.$id)}
                      className="text-red-600 hover:text-red-800 text-red-400 hover:text-red-300"
                      title="Delete Reporter"
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

export default ReporterInfo;
