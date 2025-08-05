import {
  AlertTriangle,
  Calendar,
  Check,
  Download,
  FileText,
  Filter,
  Image,
  MapPin,
  Music,
  RefreshCw,
  Trash,
  User,
  Video,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [reportsPerPage] = useState(12);
  const navigate = useNavigate();

  // Fetch all reports with essential data for list view
  const fetchReports = useCallback(async () => {
    setLoading(!refreshing);
    setError(null);

    try {
      // Build queries for filtering
      const queries = [Query.orderDesc("incident_date"), Query.limit(100)];

      if (statusFilter !== "all") {
        queries.push(Query.equal("status", statusFilter));
      }

      // Fetch main reports
      const reportsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REPORTS,
        queries
      );

      const reportsList = [];

      // For each report, fetch essential related data
      for (const report of reportsResponse.documents) {
        const reportItem = {
          $id: report.$id,
          incident_type: report.incident_type,
          incident_date: report.incident_date,
          status: report.status,
          reported_by: report.reported_by,
        };

        // Fetch metadata for description and priority
        try {
          const metadataResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.METADATA,
            [Query.equal("report_id", report.$id)]
          );
          if (metadataResponse.documents.length > 0) {
            const metadata = metadataResponse.documents[0];
            reportItem.description = metadata.description;
            reportItem.priority_level = metadata.priority_level;
            reportItem.created_at = metadata.created_at;
          }
        } catch {
          console.log(`No metadata found for report ${report.$id}`);
        }

        // Fetch location for address
        try {
          const locationResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LOCATIONS,
            [Query.equal("report_id", report.$id)]
          );
          if (locationResponse.documents.length > 0) {
            reportItem.location_address =
              locationResponse.documents[0].location_address;
          }
        } catch {
          console.log(`No location found for report ${report.$id}`);
        }

        // Fetch reporter info
        try {
          const reporterResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.INFO,
            [Query.equal("report_id", report.$id)]
          );
          if (reporterResponse.documents.length > 0) {
            reportItem.reporter_name =
              reporterResponse.documents[0].reporter_name;
          }
        } catch {
          console.log(`No reporter info found for report ${report.$id}`);
        }

        reportsList.push(reportItem);
      }

      // Apply priority filter on frontend since it's in metadata
      let filteredReports = reportsList;
      if (priorityFilter !== "all") {
        filteredReports = reportsList.filter(
          (report) => report.priority_level?.toLowerCase() === priorityFilter
        );
      }

      setReports(filteredReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError(error.message || "Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, priorityFilter, refreshing]);

  // Fetch complete report details
  const fetchCompleteReportDetails = async (reportId) => {
    try {
      // Fetch main report
      const mainReport = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.REPORTS,
        reportId
      );

      const completeReport = {
        ...mainReport,
        incident_type: mainReport.incident_type,
        incident_date: mainReport.incident_date,
        reported_by: mainReport.reported_by,
        status: mainReport.status,
      };

      // Fetch all related data in parallel
      const [
        metadataResponse,
        locationResponse,
        reporterResponse,
        victimsResponse,
        suspectsResponse,
        witnessesResponse,
        mediaResponse,
      ] = await Promise.allSettled([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.METADATA, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.LOCATIONS, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.INFO, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.VICTIMS, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.SUSPECTS, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.WITNESSES, [
          Query.equal("report_id", reportId),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.MEDIA, [
          Query.equal("report_id", reportId),
          Query.orderAsc("display_order"),
        ]),
      ]);

      // Process metadata
      if (
        metadataResponse.status === "fulfilled" &&
        metadataResponse.value.documents.length > 0
      ) {
        const metadata = metadataResponse.value.documents[0];
        completeReport.metadata = {
          incident_time: metadata.incident_time,
          is_in_progress: metadata.is_in_progress,
          description: metadata.description,
          is_victim_reporter: metadata.is_victim_reporter,
          priority_level: metadata.priority_level,
          created_at: metadata.created_at,
          updated_at: metadata.updated_at,
        };
      }

      // Process location
      if (
        locationResponse.status === "fulfilled" &&
        locationResponse.value.documents.length > 0
      ) {
        const location = locationResponse.value.documents[0];
        completeReport.location = {
          location_address: location.location_address,
          location_type: location.location_type,
          location_details: location.location_details,
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      // Process reporter info
      if (
        reporterResponse.status === "fulfilled" &&
        reporterResponse.value.documents.length > 0
      ) {
        const reporter = reporterResponse.value.documents[0];
        completeReport.reporter_info = {
          reporter_name: reporter.reporter_name,
          reporter_phone: reporter.reporter_phone,
          reporter_email: reporter.reporter_email,
        };
      }

      // Process victims
      if (victimsResponse.status === "fulfilled") {
        completeReport.victims = victimsResponse.value.documents.map(
          (victim) => ({
            victim_name: victim.victim_name,
            victim_contact: victim.victim_contact,
          })
        );
      }

      // Process suspects
      if (suspectsResponse.status === "fulfilled") {
        completeReport.suspects = suspectsResponse.value.documents.map(
          (suspect) => ({
            suspect_description: suspect.suspect_description,
            suspect_vehicle: suspect.suspect_vehicle,
          })
        );
      }

      // Process witnesses
      if (witnessesResponse.status === "fulfilled") {
        completeReport.witnesses = witnessesResponse.value.documents.map(
          (witness) => ({
            witness_info: witness.witness_info,
          })
        );
      }

      // Process media
      if (mediaResponse.status === "fulfilled") {
        completeReport.media = mediaResponse.value.documents;
      }

      return completeReport;
    } catch (error) {
      console.error("Error fetching complete report details:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);
  const handleReportPress = async (report) => {
    try {
      setModalLoading(true);
      setError(null);
      console.log("Fetching details for report:", report.$id);
      const completeReport = await fetchCompleteReportDetails(report.$id);
      console.log("Complete report data:", completeReport);
      setSelectedReport(completeReport);
    } catch (error) {
      console.error("Failed to fetch report details:", error);
      setError("Failed to load report details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.REPORTS,
        reportId
      );

      const deleteRelated = async (collectionId) => {
        const relatedDocs = await databases.listDocuments(
          DATABASE_ID,
          collectionId,
          [Query.equal("report_id", reportId)]
        );

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
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.REPORTS,
        reportId,
        {
          status: newStatus,
        }
      );

      setReports((prev) =>
        prev.map((report) =>
          report.$id === reportId ? { ...report, status: newStatus } : report
        )
      );

      // Update selected report if it's the one being updated
      if (selectedReport && selectedReport.$id === reportId) {
        setSelectedReport((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
    } catch (error) {
      console.error(`Failed to update status for report ${reportId}:`, error);
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };
  const resetModal = () => {
    setSelectedReport(null);
    setCurrentPage(1);
  };
  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-white">Loading reports...</h2>
      </div>
    </div>

    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600 text-gray-300 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchReports()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 text-white">
            All Reports
          </h1>
          <h2 className="text-gray-100 text-gray-100 mt-1">
            {reports.length} reports found
          </h2>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />{" "}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 border-gray-600 text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 border-gray-600 text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      {/* Report Sections Navigation */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/dashboard/reports/victims")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Victims
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/locations")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Locations
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/witness")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Witness
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/suspect")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Suspect
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/reporter-info")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Reporter Info
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/media")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Media
        </button>
        <button
          onClick={() => navigate("/dashboard/reports/metadata")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Metadata
        </button>
      </div>
      {/* Reports Grid */}
      {currentReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-50 text-lg">
            No reports found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentReports.map((report) => (
            <div
              key={report.$id}
              className="bg-white bg-gray-800 rounded-lg shadow-sm border border-gray-200 border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleReportPress(report)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-ray-900 text-lg">
                    {report.incident_type || "N/A"}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status?.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-600 text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(report.incident_date)}
                </div>

                {/* Description */}
                {report.description && (
                  <p className="text-gray-700 text-gray-300 text-sm mb-3 line-clamp-2">
                    {report.description}
                  </p>
                )}

                {/* Location */}
                {report.location_address && (
                  <div className="flex items-center text-sm text-blue-600 text-blue-400 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{report.location_address}</span>
                  </div>
                )}

                {/* Reporter */}
                {report.reporter_name && (
                  <div className="flex items-center text-sm text-gray-600 text-gray-300 mb-3">
                    <User className="w-4 h-4 mr-2" />
                    {report.reporter_name}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 border-gray-700">
                  {report.priority_level && (
                    <span
                      className={`text-sm font-medium ${getPriorityColor(
                        report.priority_level
                      )}`}
                    >
                      Priority: {report.priority_level}
                    </span>
                  )}{" "}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus =
                          report.status === "pending"
                            ? "in_progress"
                            : report.status === "in_progress"
                            ? "resolved"
                            : report.status === "resolved"
                            ? "closed"
                            : "pending";
                        updateStatus(report.$id, nextStatus);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Update Status"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.$id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete Report"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}{" "}
      {/* Pagination Controls */}
      {reports.length > reportsPerPage && (
        <div className="mt-8 flex items-center justify-between bg-white bg-gray-800 px-6 py-4 rounded-lg shadow-sm border border-gray-200 border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 text-gray-300">
                Showing{" "}
                <span className="font-medium">{indexOfFirstReport + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastReport, reports.length)}
                </span>{" "}
                of <span className="font-medium">{reports.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 border-gray-600 text-gray-300"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === number
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600 bg-blue-900 border-blue-400 text-blue-300"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 border-gray-600 text-gray-300"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>{" "}
        </div>
      )}
      {/* Report Details Modal */}{" "}
      {(selectedReport || modalLoading) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {modalLoading ? (
                <div className="px-6 py-8">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 text-gray-300">
                      Loading report details...
                    </p>
                  </div>
                </div>
              ) : (
                selectedReport && (
                  <div>
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 border-gray-700">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 text-white">
                            Report Details
                          </h3>
                          <p className="text-sm text-gray-500 text-gray-400">
                            {selectedReport.incident_type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetModal}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:text-gray-300"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 text-white mb-4">
                            Incident Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-50 text-gray-50">
                                Type:
                              </label>
                              <p className="mt-1 text-sm text-gray-50 text-white">
                                {selectedReport.incident_type}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-50 text-gray-50">
                                Date:
                              </label>
                              <p className="mt-1 text-sm text-gray-50 text-white">
                                {formatDate(selectedReport.incident_date)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                Status:
                              </label>
                              <div className="mt-1">
                                {" "}
                                <select
                                  value={selectedReport.status}
                                  onChange={(e) =>
                                    updateStatus(
                                      selectedReport.$id,
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-600 border-gray-500 text-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="in_progress">
                                    In Progress
                                  </option>
                                  <option value="resolved">Resolved</option>
                                  <option value="closed">Closed</option>
                                </select>
                              </div>
                            </div>
                            {selectedReport.metadata?.priority_level && (
                              <div>
                                <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                  Priority:
                                </label>
                                <p
                                  className={`mt-1 text-sm font-medium ${getPriorityColor(
                                    selectedReport.metadata.priority_level
                                  )}`}
                                >
                                  {selectedReport.metadata.priority_level}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {selectedReport.metadata?.description && (
                          <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                              Description
                            </h4>
                            <p className="text-sm text-gray-50 text-gray-300">
                              {selectedReport.metadata.description}
                            </p>
                          </div>
                        )}

                        {/* Location Information */}
                        {selectedReport.location && (
                          <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-50 text-white mb-3">
                              Location
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedReport.location.location_address && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Address:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-50 text-white">
                                    {selectedReport.location.location_address}
                                  </p>
                                </div>
                              )}
                              {selectedReport.location.location_type && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Type:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-50 text-white">
                                    {selectedReport.location.location_type}
                                  </p>
                                </div>
                              )}
                              {selectedReport.location.location_details && (
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Details:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-50 text-white">
                                    {selectedReport.location.location_details}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reporter Information */}
                        {selectedReport.reporter_info && (
                          <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                              Reporter Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedReport.reporter_info.reporter_name && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Name:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900 text-white">
                                    {selectedReport.reporter_info.reporter_name}
                                  </p>
                                </div>
                              )}
                              {selectedReport.reporter_info.reporter_phone && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Phone:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900 text-white">
                                    {
                                      selectedReport.reporter_info
                                        .reporter_phone
                                    }
                                  </p>
                                </div>
                              )}
                              {selectedReport.reporter_info.reporter_email && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-50 text-gray-300">
                                    Email:
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900 text-white">
                                    {
                                      selectedReport.reporter_info
                                        .reporter_email
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Victims */}
                        {selectedReport.victims &&
                          selectedReport.victims.length > 0 && (
                            <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                                Victims ({selectedReport.victims.length})
                              </h4>
                              <div className="space-y-3">
                                {selectedReport.victims.map((victim, index) => (
                                  <div
                                    key={index}
                                    className="bg-white bg-gray-600 rounded p-3"
                                  >
                                    {victim.victim_name && (
                                      <p className="text-sm text-gray-900 text-white">
                                        <span className="font-medium">
                                          Name:
                                        </span>{" "}
                                        {victim.victim_name}
                                      </p>
                                    )}
                                    {victim.victim_contact && (
                                      <p className="text-sm text-gray-900 text-white">
                                        <span className="font-medium">
                                          Contact:
                                        </span>{" "}
                                        {victim.victim_contact}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Suspects */}
                        {selectedReport.suspects &&
                          selectedReport.suspects.length > 0 && (
                            <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                                Suspects ({selectedReport.suspects.length})
                              </h4>
                              <div className="space-y-3">
                                {selectedReport.suspects.map(
                                  (suspect, index) => (
                                    <div
                                      key={index}
                                      className="bg-white bg-gray-600 rounded p-3"
                                    >
                                      {suspect.suspect_description && (
                                        <p className="text-sm text-gray-900 text-white">
                                          <span className="font-medium">
                                            Description:
                                          </span>{" "}
                                          {suspect.suspect_description}
                                        </p>
                                      )}
                                      {suspect.suspect_vehicle && (
                                        <p className="text-sm text-gray-900 text-white">
                                          <span className="font-medium">
                                            Vehicle:
                                          </span>{" "}
                                          {suspect.suspect_vehicle}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Witnesses */}
                        {selectedReport.witnesses &&
                          selectedReport.witnesses.length > 0 && (
                            <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                                Witnesses ({selectedReport.witnesses.length})
                              </h4>
                              <div className="space-y-3">
                                {selectedReport.witnesses.map(
                                  (witness, index) => (
                                    <div
                                      key={index}
                                      className="bg-white bg-gray-600 rounded p-3"
                                    >
                                      <p className="text-sm text-gray-900 text-white">
                                        {witness.witness_info}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Media */}
                        {selectedReport.media &&
                          selectedReport.media.length > 0 && (
                            <div className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 text-white mb-3">
                                Media ({selectedReport.media.length})
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedReport.media.map((media, index) => (
                                  <div
                                    key={index}
                                    className="bg-white bg-gray-600 rounded-lg p-3 text-center"
                                  >
                                    <div className="flex justify-center mb-2">
                                      {media.media_type === "photo" && (
                                        <Image className="w-8 h-8 text-blue-500" />
                                      )}
                                      {media.media_type === "video" && (
                                        <Video className="w-8 h-8 text-green-500" />
                                      )}
                                      {media.media_type === "audio" && (
                                        <Music className="w-8 h-8 text-purple-500" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-700 text-gray-300 truncate">
                                      {media.file_name_original}
                                    </p>
                                    <p className="text-xs text-gray-500 text-gray-400 mt-1">
                                      {media.media_type}
                                    </p>
                                    {(media.cloudinary_url ||
                                      media.secure_url ||
                                      media.file_url) && (
                                      <a
                                        href={
                                          media.cloudinary_url ||
                                          media.secure_url ||
                                          media.file_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        View
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-gray-50 bg-gray-700 border-t border-gray-200 border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 text-gray-400">
                          Report ID: {selectedReport.$id}
                        </div>{" "}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              // Cycle through statuses or set to resolved
                              const nextStatus =
                                selectedReport.status === "pending"
                                  ? "in_progress"
                                  : selectedReport.status === "in_progress"
                                  ? "resolved"
                                  : selectedReport.status === "resolved"
                                  ? "closed"
                                  : "pending";
                              updateStatus(selectedReport.$id, nextStatus);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this report?"
                                )
                              ) {
                                handleDelete(selectedReport.$id);
                                resetModal();
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete Report
                          </button>
                          <button
                            onClick={resetModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
