// app/routes/dashboard.settings.tsx
export default function DashboardSettings() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {/* Profile Settings Placeholder */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Profile
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="john.doe@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Profile
            </button>
          </div>
        </div>

        {/* Notification Settings Placeholder */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Notifications
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <input
                id="email-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked
              />
              <label
                htmlFor="email-notifications"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="push-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="push-notifications"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Push Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Theme Settings Placeholder */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Theme
          </h2>
          <div className="mt-4">
            <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white">
              <option>System Default</option>
              <option>Light Mode</option>
              <option>Dark Mode</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
