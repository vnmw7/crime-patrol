import { useState, useEffect } from "react";

export default function DashboardReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const databases = new Databases(client);

        const databaseId =
          import.meta.env.VITE_APPWRITE_DATABASE_ID || "65625ddded4758052a0f";
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_ID || "65625e86388e2748290c";

        if (!databaseId || !collectionId) {
          throw new Error("Appwrite Database or Collection ID is not configured.");
        }

        const response = await databases.listDocuments(databaseId, collectionId);

        if (response.documents.length === 0) {
          setReports(getDemoData());
          setUsingFallbackData(true);
        } else {
          setReports(response.documents);
          setUsingFallbackData(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load reports. Please try again later.");
        setReports(getDemoData());
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getDemoData = () => [
    {
      $id: "report_101",
      type: "Noise Complaint",
      status: "Submitted",
      date: "2025-05-02",
    },
    {
      $id: "report_102",
      type: "Lost Pet",
      status: "Resolved",
      date: "2025-04-28",
    },
    {
      $id: "report_103",
      type: "Suspicious Activity",
      status: "Under Review",
      date: "2025-04-29",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        My Reports
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading && (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">
            Loading reports...
          </p>
        )}

        {usingFallbackData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Showing demo data. Appwrite database not connected.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && !usingFallbackData && (
          <p className="p-6 text-center text-red-500">{error}</p>
        )}

        {!loading && !usingFallbackData && reports.length === 0 && (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">
            You have no reports yet.
          </p>
        )}

        {reports.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <li
                key={report.$id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.type}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Report #{report.$id?.substring(0, 8)}... -{" "}
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    report.status === "Resolved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : report.status === "Submitted"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
