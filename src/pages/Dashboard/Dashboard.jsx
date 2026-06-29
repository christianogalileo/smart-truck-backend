// src/pages/Dashboard/Dashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ role }) => {
  const profileImages = {
    Admin: '/images/admin.png',
    'Super Admin': '/images/superadmin.png',
    User: '/images/default-user.png',
  };

  const userImage = profileImages[role] || '/images/default-user.png';

  return (
    <div
      className="flex min-h-screen bg-fixed bg-cover bg-center"
      style={{
        background: `linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)`,
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Sidebar */}
      <div className="bg-black bg-opacity-70 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
              src={userImage}
              alt={`${role} Icon`}
              className="rounded-full mb-2 w-16 h-16 object-cover border-2 border-white"
            />
            <h2 className="font-semibold text-lg">{role}</h2>
          </div>

          <div className="space-y-6">
            {role === 'Admin' && (
              <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
                <Link to="/master-data" className="block hover:text-white">Master Data</Link>
              </div>
            )}

            {/* Hanya tampilkan menu ini jika role bukan User */}
            {(role === 'Admin' || role === 'Super Admin') && (
              <>
                <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
                  <Link to="/tracking" className="block hover:text-white">Tracking</Link>
                </div>
                <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
                  <Link to="/info-driver" className="block hover:text-white">Info Driver</Link>
                </div>
              </>
            )}

            <div className="bg-green-700 rounded-lg p-3 text-center hover:bg-green-600 transition">
              <Link to="/checkpoint" className="block hover:text-white">Checkpoint</Link>
            </div>

            {(role === 'Admin' || role === 'Super Admin') && (
              <div className="bg-blue-700 rounded-lg p-3 text-center hover:bg-blue-600 transition">
                <Link to="/timbang-muat" className="block hover:text-white">Timbang Muat</Link>
              </div>
            )}

            {(role === 'Admin' || role === 'Super Admin') && (
              <div className="bg-purple-700 rounded-lg p-3 text-center hover:bg-purple-600 transition">
                <Link to="/timbang-gudang" className="block hover:text-white">Timbang Gudang</Link>
              </div>
            )}

            {role === 'Super Admin' && (
              <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
                <Link to="/bypass" className="block hover:text-white">By Pass</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
            <Link to="/settings" className="block hover:text-white">Settings</Link>
          </div>
          <div className="bg-teal-700 rounded-lg p-3 text-center hover:bg-teal-600 transition">
            <Link to="/logout" className="block hover:text-white">Logout</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 text-white bg-black bg-opacity-40 rounded-lg m-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg text-black"
            />
            <img
              src="/images/notification-icon.png"
              alt="Notification Icon"
              className="w-6 h-6 cursor-pointer"
            />
            <img
              src={userImage}
              alt="User Icon"
              className="w-8 h-8 rounded-full cursor-pointer object-cover border-2 border-white"
            />
          </div>
        </div>

        <p className="text-lg">Selamat datang di dashboard! Silakan pilih menu di samping.</p>
      </div>
    </div>
  );
};

export default Dashboard;
