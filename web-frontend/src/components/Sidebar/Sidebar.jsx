// src/components/SidebarNav/SidebarNav.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';
import './SidebarNav.css';

const SidebarNav = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="nav-links-container">
        <ul className="nav-links">
          <li>
            <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : '')}>
            Map
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default SidebarNav;
