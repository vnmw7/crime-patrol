import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  LabelList,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useEffect, useState, useMemo, useCallback } from "react";
import { databases, Query, account } from "../lib/appwrite";
import { INCIDENT_TYPES, LOCATION_TYPES } from "../constants/reportConstants";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Database configuration from your .env
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTIONS = {
  REPORTS: import.meta.env.VITE_APPWRITE_REPORTS_COLLECTION_ID,
  METADATA: import.meta.env.VITE_APPWRITE_REPORT_METADATA_COLLECTION_ID,
  LOCATIONS: import.meta.env.VITE_APPWRITE_REPORT_LOCATIONS_COLLECTION_ID,
  EMERGENCY_PINGS: import.meta.env.VITE_APPWRITE_EMERGENCY_PINGS_COLLECTION_ID,
  USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
};

// Loading and Error Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-gray-500 text-gray-400">Loading data...</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center h-full min-h-[200px]">
    <div className="text-center p-6 bg-red-50 bg-red-900/20 rounded-lg">
      <p className="text-red-600 text-red-400 font-medium">{message}</p>
      <p className="text-sm text-red-500 text-red-300 mt-2">
        Please check your connection and try again
      </p>
    </div>
  </div>
);

const NoDataMessage = ({ message = "No data available" }) => (
  <div className="flex justify-center items-center h-full min-h-[200px]">
    <div className="text-center p-6 bg-gray-50 bg-gray-800 rounded-lg">
      <p className="text-gray-500 text-gray-400">{message}</p>
    </div>
  </div>
);

// Minimap Component for Incident Locations
const IncidentMiniMap = ({ locations }) => {
  const bacolodCoords = [10.6767, 122.9563];

  // Offset close markers to avoid overlap
  const offsetCloseMarkers = (locations) => {
    const precision = 4;
    const grouped = {};

    locations.forEach((loc) => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (!lat || !lng) return;

      const key = `${lat.toFixed(precision)}_${lng.toFixed(precision)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(loc);
    });

    const offsetDistance = 0.00005;
    const newLocations = [];

    Object.values(grouped).forEach((group) => {
      if (group.length === 1) {
        newLocations.push(group[0]);
      } else {
        const angleStep = (2 * Math.PI) / group.length;
        group.forEach((loc, idx) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);

          const angle = idx * angleStep;
          const newLat = lat + offsetDistance * Math.cos(angle);
          const newLng = lng + offsetDistance * Math.sin(angle);

          newLocations.push({
            ...loc,
            latitude: newLat.toString(),
            longitude: newLng.toString(),
          });
        });
      }
    });

    return newLocations;
  };

  const createIncidentIcon = (incidentType) => {
    // Color mapping for different incident types
    const colorMap = {
      Theft: "#EF4444",
      Burglary: "#DC2626",
      Assault: "#B91C1C",
      Robbery: "#991B1B",
      Vandalism: "#F59E0B",
      "Suspicious Activity": "#D97706",
      "Drug Activity": "#7C2D12",
      "Traffic Violation": "#3B82F6",
      "Noise Complaint": "#06B6D4",
      "Domestic Disturbance": "#8B5CF6",
      "Fraud/Scam": "#A855F7",
      Harassment: "#EC4899",
      Trespassing: "#F97316",
      "Missing Person": "#10B981",
      Other: "#6B7280",
    };

    const color = colorMap[incidentType] || "#6B7280";

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="32" viewBox="0 0 20 32">
        <path fill="${color}" stroke="white" stroke-width="1" d="M10 0C5.6 0 2 3.6 2 8c0 7.6 8 24 8 24s8-16.4 8-24c0-4.4-3.6-8-8-8z"/>
        <circle cx="10" cy="8" r="3" fill="white" />
      </svg>
    `;

    return new L.DivIcon({
      html: svgIcon,
      className: "",
      iconSize: [20, 32],
      iconAnchor: [10, 32],
      popupAnchor: [0, -32],
    });
  };

  const adjustedLocations = offsetCloseMarkers(locations);

  if (locations.length === 0) {
    return <NoDataMessage message="No incident locations to display on map" />;
  }

  return (
    <div className="h-80 w-full">
      <MapContainer
        center={bacolodCoords}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Center marker for Bacolod */}
        <Marker position={bacolodCoords}>
          <Popup>
            <div className="text-gray-800 text-sm">
              <strong>Bacolod City Center</strong>
              <br />
              Crime Patrol Coverage Area
            </div>
          </Popup>
        </Marker>

        {/* Incident location markers */}
        {adjustedLocations.map((loc) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);

          if (!lat || !lng) return null;

          const icon = createIncidentIcon(loc.incident_type);

          return (
            <Marker key={loc.$id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="text-gray-800 text-sm space-y-1">
                  <p>
                    <strong>Report ID:</strong> {loc.report_id || "N/A"}
                  </p>
                  <p>
                    <strong>Incident:</strong> {loc.incident_type || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {loc.Location_Address || "N/A"}
                  </p>
                  <p>
                    <strong>Type:</strong> {loc.Location_Type || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {loc.status || "N/A"}
                  </p>
                  {loc.Location_Details && (
                    <p>
                      <strong>Details:</strong> {loc.Location_Details}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default function DashboardOverview() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Chart data states
  const [dashboardData, setDashboardData] = useState({
    primaryStats: [],
    incidentTypes: [],
    statusDistribution: [],
    timelineData: [],
    locationData: [],
    locationsWithIncidents: [],
    lawEnforcementStats: [],
    emergencyPings: [],
    userStats: [],
    recentActivity: [],
  });

  // Color schemes
  const colorSchemes = {
    primary: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
    secondary: [
      "#60A5FA",
      "#34D399",
      "#FBBF24",
      "#F87171",
      "#A78BFA",
      "#22D3EE",
    ],
    status: {
      pending: "#F59E0B",
      in_progress: "#3B82F6",
      resolved: "#10B981",
      closed: "#6B7280",
      investigating: "#8B5CF6",
    },
  };
  // Data fetching function
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user for personalized data
      try {
        const user = await account.get();
        setCurrentUser(user);
      } catch (userError) {
        console.log("No authenticated user:", userError);
      }

      // Fetch all main reports with pagination
      let allReports = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REPORTS,
          [
            Query.limit(100),
            Query.offset(offset),
            Query.orderDesc("$createdAt"),
          ]
        );

        allReports = [...allReports, ...response.documents];
        hasMore = response.documents.length === 100;
        offset += 100;
      }

      // Fetch additional data in parallel
      const [
        metadataResponse,
        locationsResponse,
        emergencyResponse,
        usersResponse,
      ] = await Promise.all([
        databases
          .listDocuments(DATABASE_ID, COLLECTIONS.METADATA, [Query.limit(100)])
          .catch(() => ({ documents: [] })),
        databases
          .listDocuments(DATABASE_ID, COLLECTIONS.LOCATIONS, [Query.limit(100)])
          .catch(() => ({ documents: [] })),
        databases
          .listDocuments(DATABASE_ID, COLLECTIONS.EMERGENCY_PINGS, [
            Query.limit(50),
            Query.orderDesc("$createdAt"),
          ])
          .catch(() => ({ documents: [] })),
        databases
          .listDocuments(DATABASE_ID, COLLECTIONS.USERS, [Query.limit(100)])
          .catch(() => ({ documents: [] })),
      ]);

      // Process the data
      const processedData = processReportsData(
        allReports,
        metadataResponse.documents,
        locationsResponse.documents,
        emergencyResponse.documents,
        usersResponse.documents
      );

      setDashboardData(processedData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  // Data processing function
  const processReportsData = (
    reports,
    metadata,
    locations,
    emergencyPings,
    users
  ) => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Primary statistics
    const totalReports = reports.length;
    const activeReports = reports.filter(
      (r) =>
        r.status === "pending" ||
        r.status === "in_progress" ||
        r.status === "investigating"
    ).length;
    const resolvedReports = reports.filter(
      (r) => r.status === "resolved" || r.status === "closed"
    ).length;
    const recentReports = reports.filter(
      (r) => new Date(r.$createdAt) >= last7Days
    ).length;

    const primaryStats = [
      { title: "Total Reports", value: totalReports, trend: recentReports },
      { title: "Active Cases", value: activeReports, trend: activeReports },
      {
        title: "Resolved Cases",
        value: resolvedReports,
        trend: resolvedReports,
      },
      {
        title: "Emergency Pings",
        value: emergencyPings.length,
        trend: emergencyPings.filter((p) => new Date(p.$createdAt) >= last7Days)
          .length,
      },
    ];

    // Incident types distribution
    const incidentTypeCounts = {};
    reports.forEach((report) => {
      const type = report.incident_type || "Other";
      incidentTypeCounts[type] = (incidentTypeCounts[type] || 0) + 1;
    });

    const incidentTypes = Object.entries(incidentTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Status distribution
    const statusCounts = {};
    reports.forEach((report) => {
      const status = report.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCounts).map(
      ([name, value]) => ({ name, value })
    );

    // Timeline data (last 30 days)
    const timelineData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayReports = reports.filter(
        (r) => r.$createdAt.split("T")[0] === dateStr
      );

      timelineData.push({
        date: dateStr,
        reports: dayReports.length,
        resolved: dayReports.filter((r) => r.status === "resolved").length,
        pending: dayReports.filter((r) => r.status === "pending").length,
      });
    } // Location data processing with incident information
    const locationsWithIncidents = locations
      .map((location) => {
        const relatedReport = reports.find((r) => r.$id === location.report_id);
        return {
          ...location,
          incident_type: relatedReport?.incident_type || "Unknown",
          status: relatedReport?.status || "pending",
        };
      })
      .filter((loc) => loc.latitude && loc.longitude);

    const locationStats = locations.reduce((acc, location) => {
      const type = location.Location_Type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const locationData = Object.entries(locationStats)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 8);

    // User statistics
    const userStats = [
      { name: "Total Users", value: users.length },
      {
        name: "Verified Users",
        value: users.filter((u) => u.isVerified).length,
      },
      {
        name: "Active Reporters",
        value: new Set(reports.map((r) => r.reported_by)).size,
      },
      {
        name: "New Users (7d)",
        value: users.filter((u) => new Date(u.$createdAt) >= last7Days).length,
      },
    ];

    // Law enforcement statistics (based on available data)
    const lawEnforcementStats = [
      {
        name: "Emergency Calls",
        value: emergencyPings.length,
      },
      {
        name: "Avg. Response Time",
        value: Math.round(Math.random() * 15 + 5), // Placeholder: 5-20 minutes
      },
      {
        name: "Cases Closed",
        value: resolvedReports,
      },
      {
        name: "Officers Deployed",
        value: Math.round(activeReports * 0.6), // Estimated: ~60% of active cases have officers
      },
      {
        name: "Patrol Routes",
        value: Math.max(3, Math.round(totalReports / 50)), // Estimated: 1 route per 50 reports, minimum 3
      },
    ];

    // Recent activity
    const recentActivity = reports.slice(0, 10).map((report) => ({
      id: report.$id,
      type: report.incident_type || "Unknown",
      status: report.status || "pending",
      date: report.$createdAt,
      location:
        locations.find((l) => l.report_id === report.$id)?.Location_Address ||
        "Unknown",
    }));
    return {
      primaryStats,
      incidentTypes,
      statusDistribution,
      timelineData,
      locationData,
      locationsWithIncidents,
      lawEnforcementStats,
      emergencyPings: emergencyPings.slice(0, 5),
      userStats,
      recentActivity,
    };
  };
  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized chart data
  const chartData = useMemo(
    () => ({
      primaryChart: dashboardData.primaryStats.map((stat) => ({
        name: stat.title,
        value: stat.value,
        trend: stat.trend,
      })),
    }),
    [dashboardData.primaryStats]
  );
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 text-white mb-8">
          Dashboard Overview
        </h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 text-white mb-8">
          Dashboard Overview
        </h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 text-white">
          Dashboard Overview
        </h1>
        {currentUser && (
          <div className="text-sm text-gray-600 text-gray-400">
            Welcome back, {currentUser.name || currentUser.email}
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.primaryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-500 text-gray-400">
                {stat.trend > 0 && <span className="text-green-600">↗</span>}
                {stat.trend < 0 && <span className="text-red-600">↘</span>}
                {stat.trend === 0 && <span className="text-gray-400">→</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Statistics Bar Chart */}
      <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
          Key Metrics Overview
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.primaryChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.primaryChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorSchemes.primary[index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Types Distribution */}
        <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Incident Types
          </h2>
          {dashboardData.incidentTypes.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.incidentTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {dashboardData.incidentTypes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          colorSchemes.primary[
                            index % colorSchemes.primary.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataMessage message="No incident data available" />
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Case Status Distribution
          </h2>
          {dashboardData.statusDistribution.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {dashboardData.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          colorSchemes.status[entry.name] ||
                          colorSchemes.primary[index]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataMessage message="No status data available" />
          )}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
          Reports Timeline (Last 30 Days)
        </h2>
        {dashboardData.timelineData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoDataMessage message="No timeline data available" />
        )}
      </div>

      {/* Crime Trends - Line Chart */}
      <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
          Crime Trends
        </h2>
        {dashboardData.incidentTypes.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {dashboardData.incidentTypes.slice(0, 6).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        colorSchemes.primary[
                          index % colorSchemes.primary.length
                        ],
                    }}
                  ></span>
                  <span className="text-gray-700 text-gray-300">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardData.incidentTypes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      document.documentElement.classList.contains("dark")
                        ? "#4b5563"
                        : "#e5e7eb"
                    }
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    domain={[0, "auto"]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={({ cx, cy, index }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={
                          colorSchemes.primary[
                            index % colorSchemes.primary.length
                          ]
                        }
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )}
                    activeDot={{ r: 6 }}
                  />
                  <LabelList
                    dataKey="value"
                    position="top"
                    fill="#6b7280"
                    fontSize={10}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <NoDataMessage message="No crime trend data available" />
        )}
      </div>

      {/* Law Enforcement & Response */}
      <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
          Law Enforcement & Response
        </h2>
        {dashboardData.lawEnforcementStats.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={dashboardData.lawEnforcementStats}
                margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    document.documentElement.classList.contains("dark")
                      ? "#4b5563"
                      : "#e5e7eb"
                  }
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" barSize={25} radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    fill="#6b7280"
                    fontSize={12}
                  />
                  {dashboardData.lawEnforcementStats.map((entry, index) => (
                    <Cell
                      key={`cell-law-${index}`}
                      fill={
                        colorSchemes.secondary[
                          index % colorSchemes.secondary.length
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoDataMessage message="No law enforcement data available" />
        )}
      </div>

      {/* Location and User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        {/* Incident Locations Map */}
        <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            Incident Locations Map
          </h2>
          <div className="mb-3">
            <p className="text-sm text-gray-600 text-gray-400">
              Showing {dashboardData.locationsWithIncidents.length} incident
              locations
            </p>
            {dashboardData.locationsWithIncidents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 bg-red-900 text-red-200 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Crime Incidents
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 bg-blue-900 text-blue-200 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  City Center
                </span>
              </div>
            )}
          </div>
          <IncidentMiniMap locations={dashboardData.locationsWithIncidents} />
        </div>
        {/* User Statistics */}
        <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
            User Statistics
          </h2>
          {dashboardData.userStats.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dashboardData.userStats}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <PolarRadiusAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Radar
                    name="Users"
                    dataKey="value"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataMessage message="No user data available" />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 text-white mb-4">
          Recent Activity
        </h2>
        {dashboardData.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.status === "resolved"
                        ? "bg-green-500"
                        : activity.status === "in_progress"
                        ? "bg-blue-500"
                        : activity.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900 text-white">
                      {activity.type}
                    </p>
                    <p className="text-sm text-gray-600 text-gray-400">
                      {activity.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === "resolved"
                        ? "bg-green-100 text-green-800 bg-green-800 text-green-100"
                        : activity.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 bg-blue-800 text-blue-100"
                        : activity.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 bg-yellow-800 text-yellow-100"
                        : "bg-gray-100 text-gray-800 bg-gray-800 text-gray-100"
                    }`}
                  >
                    {activity.status}
                  </p>
                  <p className="text-xs text-gray-500 text-gray-400 mt-1">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoDataMessage message="No recent activity to display" />
        )}
      </div>
    </div>
  );
}
