// src/App.jsx
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './components/homepage/HomePage';
import Login from './components/login/login';
import MapPage from './components/page/MapPage';
import Register from './components/register/register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
