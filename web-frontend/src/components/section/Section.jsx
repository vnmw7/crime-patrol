import { Eye, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { account, databases } from "../../lib/appwrite";
import SidebarNav from '../Sidebar/Sidebar';
import './SectionPage.css';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;


const SectionPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

const resetModal = () => {
  setSelectedReport(null);
  setCurrentPage(1);
};


  useEffect(() => {
  const fetchReports = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      console.log("Fetched reports:", response.documents);
      setReports(response.documents);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await account.get();
      setCurrentUser(user);
      console.log("Current user:", user);
    } catch (error) {
      console.error("Failed to get current user:", error);
      setCurrentUser(null);
    }
  };

  fetchReports();
  fetchCurrentUser();
}, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setReports((prev) => prev.filter((report) => report.$id !== id));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
  try {
    const existingReport = reports.find((r) => r.$id === id);

    if (!existingReport) {
      console.error("Report not found for update");
      return;
    }

    const reporter = currentUser?.email || currentUser?.name || "admin";

    const updatedDoc = {
      Incident_Type: existingReport.Incident_Type || "",
      Incident_Date: existingReport.Incident_Date || "",
      Reporter_Name: existingReport.Reporter_Name || "",
      Reporter_Phone: existingReport.Reporter_Phone || "",
      Location_Type: existingReport.Location_Type || "",
      Location: existingReport.Location || "",
      Description: existingReport.Description || "",
    };

    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, updatedDoc);

    setReports((prev) =>
      prev.map((report) =>
        report.$id === id ? { ...report, status: newStatus } : report
      )
    );

    setSelectedReport(null);
  } catch (error) {
    console.error(`Failed to update status to ${newStatus}:`, error);
  }
};


  return (
    <div className="container">
      <SidebarNav />
      <main className="main-content section-page">
        <h1>All Reports</h1>
        <p>View and manage all submitted reports</p>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Date/Time</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="7">No reports found.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.$id}>
                  <td>{report.Incident_Type || 'Untitled'}</td>
                  <td>{report.Incident_Date || '—'}</td>
                  <td>{report.Reporter_Name || 'Anonymous'}</td>
                  <td>
                    <span className={`status ${report.status?.toLowerCase() || 'pending'}`}>
                      {report.status || 'Pending'}
                    </span>
                  </td>
                  <td className="actions">
                    <Eye
                      className="icon view"
                      title="View"
                      onClick={() => setSelectedReport(report)}
                    />
                    <Trash
                      className="icon delete"
                      title="Delete"
                      onClick={() => handleDelete(report.$id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

              {selectedReport && (
        <div className="modal-backdrop" onClick={resetModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Report Details (Page {currentPage})</h2>

            {currentPage === 1 && (
              <>
                <p><strong>Incident Type:</strong> {selectedReport.Incident_Type || '—'}</p>
                <p><strong>Location:</strong> {selectedReport.Location || '—'}</p>
                <p><strong>Location Details:</strong> {selectedReport.Location_Details || '—'}</p>
                <p><strong>Location Type:</strong> {selectedReport.Location_Type || '—'}</p>
                <p><strong>Reporter's Email:</strong> {selectedReport.Reporter_Email || '—'}</p>
                <p><strong>Reporter's Phone Number:</strong> {selectedReport.Reporter_Phone || 'Anonymous'}</p>
                <p><strong>Witness Info:</strong> {selectedReport.Witness_Info || '—'}</p>
              </>
            )}

            {currentPage === 2 && (
              <>
                <p><strong>Victim's Name:</strong> {selectedReport.Victim_Name || '—'}</p>
                <p><strong>Victim's Contact:</strong> {selectedReport.Victim_Contact || '—'}</p>
                <p><strong>Description:</strong> {selectedReport.Description || '—'}</p>
                <p><strong>Suspect's Description:</strong> {selectedReport.Suspect_Description || '—'}</p>
                <p><strong>Suspect's Vehicle:</strong> {selectedReport.Suspect_Vehicle || '—'}</p>
                <p><strong>Is In Progress:</strong> {selectedReport.Is_In_Progress ? 'Yes' : 'No'}</p>
                <p><strong>Reported_by:</strong> {selectedReport.reported_by || '—'}</p>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="close-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="close-btn"
                disabled={currentPage === 2}
                onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
              >
                Next
              </button>
            </div>

            {currentPage === 2 && (
              <div style={{ display: 'flex', gap: '1rem'}}>
                <button
                  className="close-btn"
                  onClick={() => updateStatus(selectedReport.$id, 'Accepted')}
                >
                  Accept
                </button>
                <button
                  className="close-btn"
                  style={{ backgroundColor: '#dc3545' }}
                  onClick={() => updateStatus(selectedReport.$id, 'Rejected')}
                >
                  Reject
                </button>
              </div>
            )}

            <button onClick={resetModal} className="close-btn" style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default SectionPage;
