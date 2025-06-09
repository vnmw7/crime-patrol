import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const LOCATIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPORT_LOCATIONS_COLLECTION_ID;

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  const fetchLocations = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, LOCATIONS_COLLECTION_ID);
      console.log("Location reports:", response.documents);
      setLocations(response.documents);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (locationId) => {
    const confirmDelete = confirm("Are you sure you want to delete this location?");
    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(DATABASE_ID, LOCATIONS_COLLECTION_ID, locationId);
      setLocations((prev) => prev.filter((loc) => loc.$id !== locationId));
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="p-6 relative">
      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Location Details</h2>
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Description:</strong> {selectedLocation.location_details || "—"}</p>
              <p><strong>Latitude:</strong> {selectedLocation.latitude || "—"}</p>
              <p><strong>Longitude:</strong> {selectedLocation.longitude || "—"}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => navigate("/dashboard/reports")}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          ← Back to Reports
        </button>
        <button
          onClick={() => navigate("/dashboard/map")}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 rounded hover:bg-blue-700 dark:hover:bg-blue-800 text-white"
        >
          View on Map
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Report Locations
      </h1>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : locations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No location records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Address</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Report ID</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr
                  key={location.$id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                    {location.location_address || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {location.location_type || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {location.report_id || "—"}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-3">
                    <button
                    onClick={() => setSelectedLocation(location)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="View Details"
                    >
                    <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(location.$id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Location"
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

export default Locations;
