// src/pages/Dashboard/DashboardSuperAdmin.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const DashboardSuperAdmin = () => {
  const role = "Super Admin";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
              src="https://via.placeholder.com/50"
              alt="User Icon"
              className="rounded-full mb-2"
            />
            <h2 className="font-semibold text-lg">{role}</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/tracking" className="block hover:text-white">Tracking</Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/info-driver" className="block hover:text-white">Info Driver</Link>
            </div>
            <div className="bg-yellow-500 text-black rounded-lg p-3 text-center font-semibold shadow">
              <Link to="/bypass" className="block hover:text-black">⚠️ By Pass (Super Admin)</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/settings" className="block hover:text-white">Settings</Link>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/logout" className="block hover:text-white">Logout</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Super Admin Dashboard</h1>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg"
            />
            <img
              src="https://via.placeholder.com/24"
              alt="Notification Icon"
              className="w-6 h-6 cursor-pointer"
            />
            <img
              src="https://via.placeholder.com/24"
              alt="User Icon"
              className="w-6 h-6 rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Selamat datang, Super Admin!</h2>
          <p className="text-gray-600">Gunakan menu By Pass untuk kontrol khusus pada sistem.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;
