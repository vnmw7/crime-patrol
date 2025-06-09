import { Check, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases, Query } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

const COLLECTIONS = {
  REPORTS: import.meta.env.VITE_APPWRITE_REPORTS_COLLECTION_ID,
  METADATA: import.meta.env.VITE_APPWRITE_REPORT_METADATA_COLLECTION_ID,
  LOCATIONS: import.meta.env.VITE_APPWRITE_REPORT_LOCATIONS_COLLECTION_ID,
  INFO: import.meta.env.VITE_APPWRITE_REPORT_REPORTER_INFO_COLLECTION_ID,
  VICTIMS: import.meta.env.VITE_APPWRITE_REPORT_VICTIMS_COLLECTION_ID,
  SUSPECTS: import.meta.env.VITE_APPWRITE_REPORT_SUSPECTS_COLLECTION_ID,
  WITNESSES: import.meta.env.VITE_APPWRITE_REPORT_WITNESSES_COLLECTION_ID,
  MEDIA: import.meta.env.VITE_APPWRITE_REPORT_MEDIA_COLLECTION_ID,
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMap, setStatusMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [
          reportsRes,
          metadataRes,
          locationsRes,
          infoRes,
          victimsRes,
          suspectsRes,
          witnessesRes,
          mediaRes,
        ] = await Promise.all([
          databases.listDocuments(DATABASE_ID, COLLECTIONS.REPORTS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.METADATA),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.LOCATIONS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.INFO),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.VICTIMS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.SUSPECTS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.WITNESSES),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.MEDIA),
        ]);

        const combinedReports = reportsRes.documents.map((report) => {
          const reportId = report.$id;

          const findMatch = (docs, field) =>
            docs.find((doc) => doc?.[field]?.toString() === reportId) || null;

          const filterMatch = (docs, field) =>
            docs.filter((doc) => doc?.[field]?.toString() === reportId);

          return {
            ...report,
            metadata: findMatch(metadataRes.documents, "report_id"),
            location: findMatch(locationsRes.documents, "report_id"),
            reporterInfo: findMatch(infoRes.documents, "report_id"),
            victims: filterMatch(victimsRes.documents, "report_id"),
            suspects: filterMatch(suspectsRes.documents, "report_id"),
            witnesses: filterMatch(witnessesRes.documents, "report_id"),
            media: filterMatch(mediaRes.documents, "report_id"),
          };
        });

        console.log("fetch reports:", combinedReports);
        setReports(combinedReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleDelete = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.REPORTS, reportId);

      const deleteRelated = async (collectionId) => {
        const relatedDocs = await databases.listDocuments(DATABASE_ID, collectionId, [
          Query.equal("report_id", reportId),
        ]);

        await Promise.all(
          relatedDocs.documents.map((doc) =>
            databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
          )
        );
      };

      const relatedCollections = [
        COLLECTIONS.METADATA,
        COLLECTIONS.LOCATIONS,
        COLLECTIONS.INFO,
        COLLECTIONS.VICTIMS,
        COLLECTIONS.SUSPECTS,
        COLLECTIONS.WITNESSES,
        COLLECTIONS.MEDIA,
      ];

      await Promise.all(relatedCollections.map(deleteRelated));

      setReports((prev) => prev.filter((report) => report.$id !== reportId));
      setStatusMap((prev) => {
        const newMap = { ...prev };
        delete newMap[reportId];
        return newMap;
      });
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.REPORTS, reportId, {
        status: newStatus,
      });

      setStatusMap((prevMap) => ({
        ...prevMap,
        [reportId]: newStatus,
      }));

      setReports((prev) =>
        prev.map((report) =>
          report.$id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error(`Failed to update status for report ${reportId}:`, error);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status?.toLowerCase()) {
      case "resolved":
      case "accepted":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  const resetModal = () => {
    setSelectedReport(null);
    setCurrentPage(1);
  };

  const goToReportSection = (section) => {
    navigate(`/dashboard/reports/${section}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        All Reports
      </h1>

      {/* New buttons for report sections */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => goToReportSection("victims")}
          className="btn btn-outline btn-sm"
        >
          Victims
        </button>
        <button
          onClick={() => goToReportSection("locations")}
          className="btn btn-outline btn-sm"
        >
          Locations
        </button>
        <button
          onClick={() => goToReportSection("witness")}
          className="btn btn-outline btn-sm"
        >
          Witness
        </button>
        <button
          onClick={() => goToReportSection("suspect")}
          className="btn btn-outline btn-sm"
        >
          Suspect
        </button>
        <button
          onClick={() => goToReportSection("reporter-info")}
          className="btn btn-outline btn-sm"
        >
          Reporter Info
        </button>
        <button
          onClick={() => goToReportSection("media")}
          className="btn btn-outline btn-sm"
        >
          Media
        </button>
        <button
          onClick={() => goToReportSection("metadata")}
          className="btn btn-outline btn-sm"
        >
          Metadata
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Incident Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reported by
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  {reports.length === 0 ? (
    <tr>
      <td
        colSpan="6"
        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
      >
        No reports found.
      </td>
    </tr>
  ) : (
    reports.map((report) => {
      const displayStatus =
        statusMap[report.$id] || report.status || "Pending";
      return (
        <tr
          key={report.$id}
          className="hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
            {report.incident_type || "Untitled"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
            {report.incident_date || "N/A"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
            {report.reported_by || "N/A"}
          </td>
          <td className="px-6 py-4 text-sm">
            <span className={getStatusBadge(displayStatus)}>
              {displayStatus}
            </span>
          </td>
          <td className="px-6 py-4 text-sm space-x-2">
            <button
              onClick={() => updateStatus(report.$id, "Accepted")}
              className="px-2 py-1 text-green-700 bg-green-100 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
              title="Accept Report"
              disabled={displayStatus === "Accepted"}
            >
              <Check size={16} />
            </button>

            <button
              onClick={() => updateStatus(report.$id, "Rejected")}
              className="px-2 py-1 text-red-700 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              title="Reject Report"
              disabled={displayStatus === "Rejected"}
            >
              <X size={16} />
            </button>

            <button
              onClick={() => handleDelete(report.$id)}
              className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
              title="Delete Report"
            >
              <Trash size={16} />
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 relative">
            <button
              onClick={resetModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Report Details - {selectedReport.incident_type}
            </h2>

            <div className="space-y-4">
              <p>
                <strong>Date:</strong> {selectedReport.date}
              </p>
              <p>
                <strong>Reporter:</strong> {selectedReport.reporter_name}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <select
                  value={statusMap[selectedReport.$id] || selectedReport.status}
                  onChange={(e) =>
                    updateStatus(selectedReport.$id, e.target.value)
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
