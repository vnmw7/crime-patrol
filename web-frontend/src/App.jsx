import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import layout and pages
import Dashboard from "./routes/Dashboard.jsx";
import DashboardOverview from "./routes/dashboard.overview.jsx";
import DashboardSettings from "./routes/dashboard.settings.jsx";
import DashboardChat from "./routes/dashboard.chats.jsx";
import DashboardStations from "./routes/dashboard.stations.jsx";
import Index from "./routes/index.jsx";
import Login from "./components/login/Login.jsx";
import Signup from "./components/register/Register.jsx";
import MapPage from "./components/page/MapPage";
import DashboardLogin from "./components/login/Login.jsx";
import DashboardRegister from "./components/register/Register.jsx";
import Reports from "./components/reports/reports.jsx";

// New: Blank placeholder page for dashboard root
const DashboardBlank = () => (
  <div className="text-gray-400 text-center mt-10 text-lg">
    Welcome to the Crime Patrol Dashboard.
    <br />
    Select a menu option from the left to get started.
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Index />} />

        {/* Standalone auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard layout with nested routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardBlank />} />{" "}
          {/* Default: blank screen */}
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="chat" element={<DashboardChat />} />
          <Route path="stations" element={<DashboardStations />} />
          <Route path="login" element={<DashboardLogin />} />
          <Route path="register" element={<DashboardRegister />} />
          <Route path="map" element={<MapPage />} />
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
