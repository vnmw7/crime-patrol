import {
  policeStations,
  emergencyRespondents,
} from "../constants/policeStationsData";

export default function DashboardStations() {
  const stations = policeStations;
  const responders = emergencyRespondents;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Police Stations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <div
            key={station.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {station.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {station.address}
            </p>{" "}
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Phone: {station.contactNumbers.join(", ")}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Barangay: {station.barangay}
            </p>
            {/* Optional: Add 'View on Map' button or details link */}
          </div>
        ))}{" "}
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
        Emergency Respondents
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {responders.map((responder) => (
          <div
            key={responder.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {responder.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {responder.address}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Phone: {responder.contactNumbers.join(", ")}
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
              Emergency Service
            </p>
            {/* Optional: Add 'View on Map' button or details link */}
          </div>
        ))}
      </div>
    </div>
  );
}
