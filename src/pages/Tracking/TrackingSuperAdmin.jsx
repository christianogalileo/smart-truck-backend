import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TrackingSuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('onprogress');
  const [trucks, setTrucks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const url = `${process.env.REACT_APP_API_URL}/api/trucks?status=${activeTab}${selectedDate ? `&date=${selectedDate}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setTrucks(data))
      .catch((err) => console.error("Failed to fetch trucks:", err));
  }, [activeTab, selectedDate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Super Admin */}
      <div className="bg-purple-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="https://via.placeholder.com/50" alt="Super Admin Icon" className="rounded-full mb-2" />
            <h2 className="font-semibold text-lg">Super Admin</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-purple-700 rounded-lg p-3 text-center">
              <Link to="/dashboard" className="block hover:text-white">Dashboard</Link>
            </div>
            <div className="bg-purple-700 rounded-lg p-3 text-center">
              <Link to="/tracking-superadmin" className="block hover:text-white">Tracking</Link>
            </div>
            <div className="bg-purple-700 rounded-lg p-3 text-center">
              <Link to="/users-management" className="block hover:text-white">Kelola Users</Link>
            </div>
          </div>
        </div>
        <div className="space-y-6 mt-6">
          <div className="bg-purple-700 rounded-lg p-3 text-center">
            <Link to="/settings" className="block hover:text-white">Settings</Link>
          </div>
          <div className="bg-purple-700 rounded-lg p-3 text-center">
            <Link to="/logout" className="block hover:text-white">Logout</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tracking Kendaraan</h1>
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Filter:</h2>
            <button
              onClick={() => setActiveTab('onprogress')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'onprogress' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              On Progress
            </button>
            <button
              onClick={() => setActiveTab('finished')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'finished' ? 'bg-green-600 text-white' : 'bg-white border'}`}>
              Finished
            </button>
            <button
              onClick={() => setActiveTab('trouble')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'trouble' ? 'bg-red-600 text-white' : 'bg-white border'}`}>
              Trouble
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Truck Cards */}
        <div className="grid grid-cols-1 gap-6">
          {trucks.length === 0 ? (
            <p className="text-center text-gray-600">Tidak ada truk dengan status "{activeTab}"</p>
          ) : (
            trucks.map((truck) => (
              <div key={truck.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-6">
                  <img src={truck.image || "https://via.placeholder.com/150"} alt="Truck" className="w-32 h-32 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Truck ID: {truck.id}</h3>
                    <p className="text-sm">Truck Type: <strong>{truck.type === 'fuso' ? 'Truck Fuso' : 'Dump Truck'}</strong></p>
                    <p className="text-sm">Driver: {truck.driver}</p>
                    <p className="text-sm">Status: <span className="italic">{truck.status}</span></p>
                    <p className="text-sm">Date: {truck.timestamp?.split('T')[0]}</p>
                    <div className="mt-4">
                      <img src="https://via.placeholder.com/300x200?text=Peta+Lokasi" alt="Map" className="rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingSuperAdmin;
