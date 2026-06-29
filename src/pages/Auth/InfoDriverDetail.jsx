import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const InfoDriverDetail = () => {
  const { truckId } = useParams();
  const [truck, setTruck] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loadings, setLoadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // ================= TRUCK DETAIL =================
        const resTruck = await fetch(
          `http://localhost:5000/api/trucks/${encodeURIComponent(truckId)}/details`
        );

        if (!resTruck.ok) throw new Error("Gagal mengambil data truck");

        const data = await resTruck.json();
        setTruck(data.truck || null);

        // ================= CHECKPOINT =================
        const sortedCheckpoints = (data.checkpoints || []).sort((a, b) => {
          const numA = parseInt(a.checkpoint.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.checkpoint.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

        setCheckpoints(sortedCheckpoints);

        // ================= LOADINGS =================
        const resLoadings = await fetch(
          `http://localhost:5000/api/loadings/${encodeURIComponent(truckId)}`
        );

        if (!resLoadings.ok) throw new Error("Gagal mengambil data timbang muat");

        const loadingData = await resLoadings.json();
        setLoadings(Array.isArray(loadingData) ? loadingData : []);

      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    if (truckId) fetchData();
  }, [truckId]);

  // ================= EXPORT =================
  const handleExportExcel = () => {
    if (truck?.truckId) {
      window.open(
        `http://localhost:5000/api/export/truck/${encodeURIComponent(truck.truckId)}/excel`,
        "_blank"
      );
    } else {
      alert("Data truck belum tersedia.");
    }
  };

  const handleExportPDF = () => {
    if (truck?.truckId) {
      window.open(
        `http://localhost:5000/api/export/truck/${encodeURIComponent(truck.truckId)}/pdf`,
        "_blank"
      );
    } else {
      alert("Data truck belum tersedia.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">

      {/* Sidebar (TETAP) */}
      <div className="bg-gray-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/admin.png"
              alt="Admin Icon"
              className="rounded-full mb-2 w-16 h-16 object-cover"
            />
            <h2 className="font-semibold text-lg">Admin</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/master-data">Master Data</Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/tracking">Tracking</Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/info-driver">Info Driver</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/settings">Settings</Link>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/logout">Logout</Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (TETAP STYLE KAMU) */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Detail Info Driver</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !truck ? (
          <p className="text-gray-600">Data truck tidak ditemukan.</p>
        ) : (
          <>
            {/* TRUCK CARD (TETAP) */}
            <div className="max-w-lg bg-white shadow-lg rounded-lg p-6 mx-auto mb-8">
              <img
                src={
                  truck.image_path
                    ? `http://localhost:5000/uploads/${truck.image_path}`
                    : "https://via.placeholder.com/300"
                }
                alt="Truck"
                className="w-full h-48 object-cover rounded mb-4"
              />

              <h2 className="text-lg font-semibold mb-2">
                Truck ID: {truck.truckId}
              </h2>

              <p><strong>Plat Nomor:</strong> {truck.plateNumber || "-"}</p>
              <p><strong>Tipe:</strong> {truck.truckType || "-"}</p>
              <p><strong>Driver:</strong> {truck.driver || "-"}</p>
              <p><strong>Tanggal:</strong> {truck.date ? truck.date.split("T")[0] : "-"}</p>

              <div className="mt-4">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                >
                  Export Excel
                </button>

                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Export PDF
                </button>

                <Link
                  to="/info-driver"
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded inline-block"
                >
                  Kembali
                </Link>
              </div>
            </div>

            {/* CHECKPOINT (TETAP) */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Checkpoint Logs</h2>

              {checkpoints.length === 0 ? (
                <p>Belum ada checkpoint.</p>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Checkpoint</th>
                      <th className="border p-2">Timestamp</th>
                    </tr>
                  </thead>

                  <tbody>
                    {checkpoints.map((cp) => (
                      <tr key={cp.id}>
                        <td className="border p-2">{cp.checkpoint}</td>
                        <td className="border p-2">
                          {cp.timestamp
                            ? new Date(cp.timestamp).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ================= TIMBANG MUAT (FIXED ONLY HERE) ================= */}
           {/* ================= DATA ================= */}
{/* ================= DATA ================= */}
<div className="bg-white shadow-lg rounded-lg p-6">
  <h2 className="text-lg font-semibold mb-4">Data</h2>

  {loadings.length === 0 ? (
    <p>Belum ada data.</p>
  ) : (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Tanggal</th>
          <th className="border p-2">No Palka</th>
          <th className="border p-2">No Truck</th>
          <th className="border p-2">Plat Kendaraan</th>
          <th className="border p-2">Jenis</th>

          <th className="border p-2">Tara Belawan</th>
          <th className="border p-2">Bruto Belawan</th>
          <th className="border p-2">Netto Belawan</th>

          <th className="border p-2">Tara Gudang</th>
          <th className="border p-2">Bruto Gudang</th>
          <th className="border p-2">Netto Gudang</th>

          <th className="border p-2">Selisih Tara</th>
          <th className="border p-2">Selisih Bruto</th>
          <th className="border p-2">Selisih Netto</th>
        </tr>
      </thead>

      <tbody>
        {loadings.map((item) => {
          const taraSelisih =
            (item.tara_gudang || 0) - (item.tara_belawan || 0);

          const brutoSelisih =
            (item.bruto_gudang || 0) - (item.bruto_belawan || 0);

          const nettoSelisih =
            (item.netto_gudang || 0) - (item.netto_belawan || 0);

          return (
            <tr key={item.id}>
              <td className="border p-2">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : "-"}
              </td>

              <td className="border p-2">{item.no_palka || "-"}</td>
              <td className="border p-2">{item.truckId || "-"}</td>

              {/* PLAT KENDARAAN */}
              <td className="border p-2">{item.plateNumber || "-"}</td>

              <td className="border p-2">{item.itemType || "-"}</td>

              <td className="border p-2">{item.tara_belawan || 0}</td>
              <td className="border p-2">{item.bruto_belawan || 0}</td>

              {/* NETTO BELAWAN */}
              <td className="border p-2 font-semibold">
                {item.netto_belawan || 0}
              </td>

              <td className="border p-2">{item.tara_gudang || 0}</td>
              <td className="border p-2">{item.bruto_gudang || 0}</td>

              <td className="border p-2 font-bold">
                {item.netto_gudang || 0}
              </td>

              <td className="border p-2">{taraSelisih}</td>
              <td className="border p-2">{brutoSelisih}</td>
              <td className="border p-2 font-bold">{nettoSelisih}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</div>

          </>
        )}
      </div>
    </div>
  );
};

export default InfoDriverDetail;