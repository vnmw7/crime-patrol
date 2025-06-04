// src/homepage/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';
import SidebarNav from '../Sidebar/Sidebar';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <div className="container">
      {}
      <SidebarNav onLogout={handleLogout} />

      <main className="main-content">
        <h1>Welcome to the Home Page</h1>
        <p>This is a placeholder. Replace with your map or dashboard later.</p>
      </main>
    </div>
  );
};

export default HomePage;
