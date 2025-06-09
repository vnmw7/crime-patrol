import {
  Route,
  BrowserRouter as Router,
  Routes
} from "react-router-dom";

import { default as Login } from "./components/login/Login.jsx";
import MapPage from "./components/page/MapPage";
import Index from "./routes/index.jsx";



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
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/section" element={<SectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
