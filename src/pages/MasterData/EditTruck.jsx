import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const EditTruck = () => {
  const { truckId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    truckId: '',
    truckType: '',
    driver: '',
    plateNumber: '', // ✅ tambahkan plateNumber
    status: 'onprogress',
    date: '',
    image: null,
    existingImage: '',
  });

  useEffect(() => {
    const fetchTruckData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/trucks/${truckId}`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            truckId: data.truckId,
            truckType: data.truckType,
            driver: data.driver,
            plateNumber: data.plateNumber || '', // ✅ ambil plateNumber
            status: data.status,
            date: data.date,
            image: null,
            existingImage: data.image,
          });
        } else {
          console.error('Data not found');
          navigate('/master-data');
        }
      } catch (err) {
        console.error('Failed to fetch truck data:', err);
      }
    };

    fetchTruckData();
  }, [truckId, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm((prevForm) => ({ ...prevForm, image: files[0] }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('truckId', form.truckId);
    formData.append('truckType', form.truckType);
    formData.append('driver', form.driver);
    formData.append('plateNumber', form.plateNumber); // ✅ sertakan plateNumber
    formData.append('status', form.status);
    formData.append('date', form.date);
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/trucks/${truckId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Truck successfully updated!');
        navigate('/master-data');
      } else {
        alert(data.message || 'Failed to update truck');
      }
    } catch (err) {
      alert('Failed to connect to the server');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="bg-gray-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="/images/admin.png" alt="Admin Icon" className="rounded-full mb-2" />
            <h2 className="font-semibold text-lg">Admin</h2>
          </div>

          <nav className="space-y-6">
            <Link to="/master-data" className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white">Master Data</Link>
            <Link to="/tracking" className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white">Tracking</Link>
            <Link to="/info-driver" className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white">Info Driver</Link>
          </nav>
        </div>

        <nav className="space-y-6 mt-6">
          <Link to="/settings" className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white">Settings</Link>
          <Link to="/logout" className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white">Logout</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Edit Truck</h1>
            <span className="text-lg font-medium text-gray-600">/ Edit</span>
          </div>
        </header>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Edit Truck Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block text-sm font-medium text-gray-700">Truck ID</label>
              <input
                type="text"
                name="truckId"
                value={form.truckId}
                onChange={handleChange}
                disabled
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Truck Type</label>
              <select
                name="truckType"
                value={form.truckType}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              >
                <option value="Dump Truck">Dump Truck</option>
                <option value="Fuso">Fuso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Driver</label>
              <input
                type="text"
                name="driver"
                value={form.driver}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Plate Number</label> {/* ✅ Tambahan */}
              <input
                type="text"
                name="plateNumber"
                value={form.plateNumber}
                onChange={handleChange}
                placeholder="B 1234 XYZ"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              >
                <option value="onprogress">On Progress</option>
                <option value="finished">Finished</option>
                <option value="trouble">Trouble</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Choose a Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gambar Truck</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
              {form.existingImage && !form.image && (
                <img src={`${process.env.REACT_APP_API_URL}/uploads/${form.existingImage}`} alt="Truck Preview" className="mt-2 h-32 object-cover rounded" />
              )}
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Update Truck
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditTruck;
