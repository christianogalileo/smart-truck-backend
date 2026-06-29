import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MasterData = ({ role }) => { // ← sekarang menerima role langsung
  const navigate = useNavigate();
  const userRole = role || 'User';

  const [form, setForm] = useState({
    truckId: '',
    truckType: '',
    driver: '',
    plateNumber: '',
    status: 'onprogress',
    date: '',
    image: null,
  });

  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [isRFIDScanned, setIsRFIDScanned] = useState(false);
  const [rfidValue, setRfidValue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const apiUrl = 'http://localhost:5000';

  // RFID polling
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isEditing) return;
      try {
        const res = await fetch(`${apiUrl}/api/rfid/latest`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();

        if (data && data.truck) {
          setIsRFIDScanned(true);
          setRfidValue(data.truck.truckId);
          const fullDate = data.truck.date || '';
          const dateOnly = fullDate ? fullDate.split('T')[0] : '';
          setForm({
            truckId: data.truck.truckId || '',
            truckType: data.truck.truckType || '',
            driver: data.truck.driver || '',
            plateNumber: data.truck.plateNumber || '',
            status: data.truck.status || 'onprogress',
            date: dateOnly,
            image: null
          });
          setIsEditing(true);
        } else if (data && data.rfid) {
          setIsRFIDScanned(true);
          setRfidValue(data.rfid);
          setForm(prev => ({ ...prev, truckId: data.rfid }));
          setIsEditing(false);
        } else {
          setIsRFIDScanned(false);
          setRfidValue(null);
          setForm({ truckId: '', truckType: '', driver: '', plateNumber: '', status: 'onprogress', date: '', image: null });
          setIsEditing(false);
        }
      } catch (err) {
        console.error('Error fetching RFID:', err);
        setIsRFIDScanned(false);
        setRfidValue(null);
        setForm({ truckId: '', truckType: '', driver: '', plateNumber: '', status: 'onprogress', date: '', image: null });
        setIsEditing(false);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [isEditing]);

  // Fetch data trucks
  const fetchTrucks = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/trucks`);
      const data = await res.json();
      if (res.ok) {
        setTrucks(data);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch truck data', err);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRFIDScanned) {
      alert('Silakan scan kartu RFID terlebih dahulu!');
      return;
    }

    const formData = new FormData();
    formData.append('truckId', form.truckId);
    formData.append('truckType', form.truckType);
    formData.append('driver', form.driver);
    formData.append('plateNumber', form.plateNumber);
    formData.append('status', form.status);
    formData.append('date', form.date);
    formData.append('rfid', rfidValue);
    if (form.image) formData.append('image', form.image);

    try {
      const res = await fetch(`${apiUrl}/api/trucks`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Truck successfully saved!');
        setForm({ truckId: '', truckType: '', driver: '', plateNumber: '', status: 'onprogress', date: '', image: null });
        fetchTrucks();
        setIsRFIDScanned(false);
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to save truck data');
      }
    } catch (err) {
      alert('Connection to server failed');
      console.error(err);
    }
  };

  const handleDelete = async (truckId) => {
    if (!window.confirm('Are you sure you want to delete this truck?')) return;

    try {
      const res = await fetch(`${apiUrl}/api/trucks/${truckId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert('Truck successfully deleted!');
        fetchTrucks();
      } else {
        alert(data.message || 'Failed to delete truck');
      }
    } catch (err) {
      alert('Connection to server failed');
      console.error(err);
    }
  };

  const handleEdit = (truckId) => {
    navigate(`/edit-truck/${truckId}`);
  };

  const filteredTrucks = trucks.filter(truck =>
    truck.truckId.toLowerCase().includes(search.toLowerCase()) ||
    truck.truckType.toLowerCase().includes(search.toLowerCase()) ||
    truck.driver.toLowerCase().includes(search.toLowerCase()) ||
    (truck.plateNumber && truck.plateNumber.toLowerCase().includes(search.toLowerCase())) ||
    truck.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-fixed bg-cover bg-center" style={{ background: `linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)` }}>
      
      {/* Sidebar */} 
        <aside className="bg-black bg-opacity-70 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
src="/images/admin.png"
  alt="User Icon"
  className="rounded-full mb-2 w-16 h-16 object-cover"
/>
            <h2 className="font-semibold text-lg">{userRole}</h2>
          </div>

<nav className="space-y-6">
  <Link
    to="/master-data"
    className="block bg-blue-700 rounded-lg p-3 text-center hover:bg-blue-600"
  >
    Master Data
  </Link>

  {(userRole === "Admin" || userRole === "Super Admin") && (
    <Link
      to="/info-driver"
      className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600"
    >
      Info Driver
    </Link>
  )}

  <Link
    to="/checkpoint"
    className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600"
  >
    Checkpoint
  </Link>

  <Link
    to="/timbang-muat"
    className="block bg-indigo-700 hover:bg-indigo-600 rounded-lg p-3 text-center"
  >
    Timbang Muat
  </Link>

  <Link
    to="/timbang-gudang"
    className="block bg-indigo-700 hover:bg-indigo-600 rounded-lg p-3 text-center"
  >
    Timbang Gudang
  </Link>
</nav>
        </div>

        <nav className="space-y-6 mt-6">
  <Link
    to="/logout"
    className="block bg-red-600 rounded-lg p-3 text-center hover:bg-red-500"
  >
    Logout
  </Link>
</nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <span className="text-lg font-medium text-gray-600">/ Truck</span>
          </div>
        </header>

        {/* Status RFID */}
        <div className={`mb-4 text-white p-3 rounded ${isRFIDScanned ? 'bg-green-500' : 'bg-red-500'}`}>
          {isRFIDScanned ? `RFID Terdeteksi: ${rfidValue}` : 'Silakan scan kartu RFID...'}
        </div>

        {/* Form tambah truck */}
        <section className={`mb-6 bg-white p-6 rounded-lg shadow-md space-y-4 ${isRFIDScanned ? '' : 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-xl font-semibold mb-2">Tambah Truck Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block text-sm font-medium text-gray-700">Truck ID</label>
              <input readOnly type="text" name="truckId" value={form.truckId} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Truck Type</label>
              <input type="text" name="truckType" value={form.truckType} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver</label>
              <input type="text" name="driver" value={form.driver} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plate Number</label>
              <input type="text" name="plateNumber" value={form.plateNumber} onChange={handleChange} required placeholder="B 1234 XYZ" className="mt-1 p-2 border border-gray-300 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded w-full">
                <option value="onprogress">On Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image (optional)</label>
              <input type="file" name="image" onChange={handleChange} accept="image/*" className="mt-1" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save</button>
          </form>
        </section>

        {/* Search */}
        <section className="mb-4">
          <input type="text" placeholder="Search trucks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
        </section>

        {/* List Trucks */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">List Trucks</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Truck ID</th>
                <th className="border border-gray-300 p-2">Truck Type</th>
                <th className="border border-gray-300 p-2">Driver</th>
                <th className="border border-gray-300 p-2">Plate Number</th>
                <th className="border border-gray-300 p-2">Status</th>
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrucks.length > 0 ? (
                filteredTrucks.map((truck) => (
                  <tr key={truck.truckId}>
                    <td className="border border-gray-300 p-2">
                      {truck.image_url ? (
                        <img src={truck.image_url} alt="Truck" className="w-24 h-24 object-cover rounded" />
                      ) : (
                        <span className="text-gray-500">No Image</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">{truck.truckId}</td>
                    <td className="border border-gray-300 p-2">{truck.truckType}</td>
                    <td className="border border-gray-300 p-2">{truck.driver}</td>
                    <td className="border border-gray-300 p-2">{truck.plateNumber || '-'}</td>
                    <td className="border border-gray-300 p-2">{truck.status}</td>
                    <td className="border border-gray-300 p-2">{truck.date ? truck.date.split('T')[0] : ''}</td>
                    <td className="border border-gray-300 p-2 space-x-2">
                      {userRole === 'Admin' ? (
                        <>
                          <button onClick={() => handleEdit(truck.truckId)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
                          <button onClick={() => handleDelete(truck.truckId)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
                        </>
                      ) : (
                        <>
                          <button disabled className="bg-yellow-500 text-white px-2 py-1 rounded opacity-50 cursor-not-allowed">Edit</button>
                          <button disabled className="bg-red-600 text-white px-2 py-1 rounded opacity-50 cursor-not-allowed">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">No trucks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default MasterData;
