import {
<<<<<<< HEAD
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { default as DashboardLogin, default as Login } from "./components/login/Login.jsx";
import MapPage from "./components/page/MapPage";
import { default as DashboardRegister, default as Signup } from "./components/register/Register.jsx";
import Reports from "./components/reports/reports.jsx";
import DashboardChat from "./routes/dashboard.chats.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import DashboardOverview from "./routes/dashboard.overview.jsx";
import DashboardSettings from "./routes/dashboard.settings.jsx";
import DashboardStations from "./routes/dashboard.stations.jsx";
import Index from "./routes/index.jsx";

import Locations from "./components/reports/Locations.jsx";
import Media from "./components/reports/Media.jsx";
import Metadata from "./components/reports/Metadata.jsx";
import ReporterInfo from "./components/reports/ReporterInfo.jsx";
import Suspect from "./components/reports/Suspects.jsx";
import Victims from "./components/reports/victims.jsx";
import Witness from "./components/reports/Witness.jsx";

import InternalUserManagement from "./components/internal/InternalUserManagement.jsx";
import UserContacts from "./components/internal/UserContacts.jsx";
import UserDocuments from "./components/internal/UserDocuments.jsx";

=======
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
>>>>>>> 5546cebe4576f61bb43c2722c35c4e99a2ffb80d
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
<<<<<<< HEAD
          <Route index element={<DashboardBlank />} /> {/* Default: blank screen */}
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="reports" element={<Reports />} />
          
          {/* New nested report-by routes */}
          <Route path="reports/victims" element={<Victims />} />
          <Route path="reports/locations" element={<Locations />} />
          <Route path="reports/witness" element={<Witness />} />
          <Route path="reports/suspect" element={<Suspect />} />
          <Route path="reports/reporter-info" element={<ReporterInfo />} />
          <Route path="reports/media" element={<Media />} />
          <Route path="reports/metadata" element={<Metadata />} />

=======
          <Route index element={<DashboardBlank />} />{" "}
          {/* Default: blank screen */}
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="reports" element={<Reports />} />
>>>>>>> 5546cebe4576f61bb43c2722c35c4e99a2ffb80d
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="chat" element={<DashboardChat />} />
          <Route path="stations" element={<DashboardStations />} />
          <Route path="login" element={<DashboardLogin />} />
          <Route path="register" element={<DashboardRegister />} />
          <Route path="map" element={<MapPage />} />
<<<<<<< HEAD

          <Route path="internal-users" element={<InternalUserManagement />} />
          <Route path="internal-users/documents" element={<UserDocuments />} />
          <Route path="internal-users/contacts" element={<UserContacts />} />
=======
>>>>>>> 5546cebe4576f61bb43c2722c35c4e99a2ffb80d
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
