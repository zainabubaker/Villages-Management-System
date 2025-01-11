import React from 'react'; 
import { Link } from 'react-router-dom';
const Sidebar = () => {
  
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">Dashboard</div>
      <nav className="flex-1">
        <ul>
          <li>
            <Link to="/Overview" className="block px-4 py-2 hover:bg-gray-700">
              Overview
            </Link>
          </li>
          <li>
            <Link to="/AdminVillageManagement" className="block px-4 py-2 hover:bg-gray-700">
              Village Management
            </Link>
          </li>
          <li>
            <Link to="/AdminChat" className="block px-4 py-2 hover:bg-gray-700">
              Chat
            </Link>
          </li>
          <li>
            <Link to="/Gallery" className="block px-4 py-2 hover:bg-gray-700">
              Gallery
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4">
      
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
