export default function DashboardOverview() {
  const overviewStats = [
    {
      title: "Total Incidents",
      value: "1,234",
      change: "+5%",
      changeType: "positive",
    },
    {
      title: "Active Cases",
      value: "56",
      change: "-2%",
      changeType: "negative",
    },
    {
      title: "Reports Filed",
      value: "789",
      change: "+10%",
      changeType: "positive",
    },
    {
      title: "Stations Nearby",
      value: "3",
      change: "0%",
      changeType: "neutral",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {overviewStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p
              className={`mt-1 text-sm ${
                stat.changeType === "positive"
                  ? "text-green-600 dark:text-green-400"
                  : stat.changeType === "negative"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {stat.change} vs last month
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Placeholder for recent incidents feed or a mini-map...
        </p>
      </div>
    </div>
  );
}
