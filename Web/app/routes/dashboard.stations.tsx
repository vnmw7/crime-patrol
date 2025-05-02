// app/routes/dashboard.stations.tsx
export default function DashboardStations() {
  // Placeholder data for police stations
  const stations = [
    {
      id: 1,
      name: "Central Precinct",
      address: "123 Police Plaza",
      phone: "555-1234",
    },
    {
      id: 2,
      name: "North Station",
      address: "456 Patrol Ave",
      phone: "555-5678",
    },
    {
      id: 3,
      name: "South Division",
      address: "789 Copse Rd",
      phone: "555-9012",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Police Stations
      </h1>

      {/* Placeholder for station list/cards */}
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
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Phone: {station.phone}
            </p>
            {/* Add more details or actions like 'View on Map' */}
          </div>
        ))}
      </div>
    </div>
  );
}
