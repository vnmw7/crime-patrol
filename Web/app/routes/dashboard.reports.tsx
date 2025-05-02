// app/routes/dashboard.reports.tsx
export default function DashboardReports() {
  // Placeholder data for user reports
  const reports = [
    {
      id: 101,
      type: "Noise Complaint",
      status: "Submitted",
      date: "2025-04-30",
    },
    { id: 102, type: "Lost Pet", status: "Resolved", date: "2025-04-28" },
    {
      id: 103,
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

      {/* Placeholder for reports list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {reports.map((report) => (
            <li
              key={report.id}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {report.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Report #{report.id} - {report.date}
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
      </div>
    </div>
  );
}
