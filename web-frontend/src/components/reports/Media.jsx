import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MEDIA_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPORT_MEDIA_COLLECTION_ID;

const Media = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, MEDIA_COLLECTION_ID);
      console.log("Media reports:", res.documents);
      setMediaItems(res.documents);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, MEDIA_COLLECTION_ID, id);
      setMediaItems((prev) => prev.filter((item) => item.$id !== id));
    } catch (err) {
      console.error("Error deleting media:", err);
    }
  };

  useEffect(() => {
    fetchMedia();
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
        Media Records
      </h1>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <p className="p-4 text-gray-500 dark:text-gray-300">Loading...</p>
        ) : mediaItems.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-300">No media found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Media Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Display Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Report ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mediaItems.map((media) => (
                <tr key={media.$id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{media.file_name_original || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{media.media_type || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{media.display_order ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{media.report_id || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteMedia(media.$id)}
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

export default Media;
