import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import route pages
import Dashboard from "./routes/Dashboard.jsx";
import DashboardOverview from "./routes/dashboard.overview.jsx";
import DashboardReports from "./routes/dashboard.reports.jsx";
import DashboardSettings from "./routes/dashboard.settings.jsx";
import DashboardChat from "./routes/dashboard.chats.jsx";
import DashboardIncidents from "./routes/dashboard.incidents.jsx";
import DashboardStations from "./routes/dashboard.stations.jsx";
import Index from "./routes/index.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/dashboard/overview" element={<DashboardOverview />} />
        <Route path="/dashboard/reports" element={<DashboardReports />} />
        <Route path="/dashboard/settings" element={<DashboardSettings />} />
        <Route path="/dashboard/chat" element={<DashboardChat />} />
        <Route path="/dashboard/incidents" element={<DashboardIncidents />} />
        <Route path="/dashboard/stations" element={<DashboardStations />} />
      </Routes>
    </Router>
  );
}

export default App;
