import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Tracking = () => {
  const [activeTab, setActiveTab] = useState('On Progress');
  const [trucks, setTrucks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = 'http://localhost:5000';

  const mapStatusToValue = (status) => {
    switch (status) {
      case 'On Progress':
        return 'onprogress';
      case 'Completed':
        return 'completed';
      case 'Trouble':
        return 'trouble';
      default:
        return '';
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    const statusQuery = mapStatusToValue(activeTab);
    const url = `${apiUrl}/api/trucks?status=${encodeURIComponent(statusQuery)}${selectedDate ? `&date=${selectedDate}` : ''}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data');
        return res.json();
      })
      .then((data) => setTrucks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab, selectedDate]);

  return (
    <div
      className="flex min-h-screen bg-fixed bg-cover bg-center"
      style={{
        background: `linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)`
      }}
    >
      {/* Sidebar */}
      <div className="bg-black bg-opacity-70 text-white w-64 p-6 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="/images/admin.png" alt="Admin Icon" className="rounded-full mb-2 shadow" />
            <h2 className="font-bold text-xl">Admin</h2>
          </div>
          <div className="space-y-4">
            <Link to="/master-data" className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center">Master Data</Link>
            <Link to="/tracking" className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center">Tracking</Link>
            <Link to="/checkpoint" className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center">Checkpoint</Link>
            <Link to="/info-driver" className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center">Info Driver</Link>
            <Link to="/timbang-muat" className="block bg-indigo-700 hover:bg-indigo-600 rounded-lg p-3 text-center">Timbang Muat</Link>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <Link to="/settings" className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center">Settings</Link>
          <Link to="/logout" className="block bg-red-600 hover:bg-red-500 rounded-lg p-3 text-center">Logout</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white bg-opacity-80 rounded-tl-3xl shadow-inner m-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('On Progress')}
              className={`px-4 py-2 rounded-full font-medium ${activeTab === 'On Progress' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-600'}`}
            >
              On Progress
            </button>
            <button
              onClick={() => setActiveTab('Completed')}
              className={`px-4 py-2 rounded-full font-medium ${activeTab === 'Completed' ? 'bg-green-600 text-white' : 'bg-white border border-green-600 text-green-600'}`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('Trouble')}
              className={`px-4 py-2 rounded-full font-medium ${activeTab === 'Trouble' ? 'bg-red-600 text-white' : 'bg-white border border-red-600 text-red-600'}`}
            >
              Trouble
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Sedang memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {trucks.length === 0 ? (
              <p className="text-center text-gray-600">Tidak ada truk dengan status "<strong>{activeTab}</strong>"</p>
            ) : (
              trucks.map((truck) => (
                <div key={truck.truckId} className="bg-gradient-to-tr from-white via-gray-50 to-blue-50 p-4 rounded-xl shadow-md">
                  <div className="flex items-center space-x-6">
                    <img
                      src={truck.image_url ? truck.image_url : "https://via.placeholder.com/150"}
                      alt="Truck"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-700 mb-1">Truck ID: {truck.truckId}</h3>
                      <p className="text-sm text-gray-700">Driver: {truck.driver}</p>
                      <p className="text-sm text-gray-700">Plate Number: <strong>{truck.plateNumber}</strong></p> {/* ✅ tampilkan plat */}
                      <p className="text-sm text-gray-700">Status: <span className="capitalize">{truck.status}</span></p>
                      <p className="text-sm text-gray-700">Date: {truck.date ? truck.date.split('T')[0] : ''}</p>

                      <div className="mt-4">
                        <img src="https://via.placeholder.com/300x200?text=Peta+Lokasi" alt="Map" className="rounded-lg border" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
