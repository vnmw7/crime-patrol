import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop() || "overview";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 bg-gray-900">
      {/* Header */}
      <header className="bg-white bg-gray-800 shadow-sm border-b border-gray-200 border-gray-700">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 text-gray-400 hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 text-blue-400"
            >
              Crime Patrol
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search incidents..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 border-gray-600 bg-gray-50 bg-gray-700 text-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-100 hover:bg-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 bg-blue-900 flex items-center justify-center">
              <span className="text-blue-700 text-blue-300 font-medium text-sm">
                JD
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } w-64 border-r border-gray-200 border-gray-700 bg-white bg-gray-800 min-h-[calc(100vh-64px)] transition-all duration-300`}
        >
          <div className="p-5">
            <nav className="space-y-1">
              {" "}
              {[
                { path: "overview", label: "Overview", icon: "grid" },
                { path: "reports", label: "Reports", icon: "shield" },
                { path: "stations", label: "Police Stations", icon: "map-pin" },
                { path: "chat", label: "AI Assistant", icon: "chat" },
                { path: "map", label: "Map View", icon: "map" },
                {
                  path: "internal-users",
                  label: "Internal Users",
                  icon: "internal-users",
                },
                { path: "settings", label: "Settings", icon: "settings" },
              ].map(({ path, label }, i) => (
                <Link
                  key={i}
                  to={path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    currentPath === path
                      ? "bg-blue-50 text-blue-700 bg-blue-900/30 text-blue-400"
                      : "text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700"
                  }`}
                >
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
