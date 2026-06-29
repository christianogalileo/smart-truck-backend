import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "${process.env.REACT_APP_API_URL}";

const TimbangGudang = () => {
  const navigate = useNavigate();

  const [truck, setTruck] = useState(null);
  const [mode, setMode] = useState("TARA_GUDANG");
  const [list, setList] = useState([]);

  const [form, setForm] = useState({
    tara_gudang: "",
    bruto_gudang: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ================= RFID =================
  const fetchRFID = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/rfid/latest`);
      const truckData = res.data.truck;

      if (!truckData?.truckId) return;

      setTruck(truckData);

      await syncStatus(truckData.truckId);
      await fetchData(truckData.truckId);
    } catch (err) {
      console.error("RFID ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!truck) fetchRFID();
    }, 2000);

    return () => clearInterval(interval);
  }, [truck, fetchRFID]);

  // ================= STATUS =================
  const syncStatus = async (truckId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/gudang/status/${encodeURIComponent(truckId)}`
      );

      setMode(res.data.step);

      if (res.data.data) {
        setTruck(res.data.data);
      }
    } catch (err) {
      console.error("SYNC ERROR:", err);
      setMode("TARA_GUDANG");
    }
  };

  // ================= HISTORY =================
  const fetchData = async (truckId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/gudang/${encodeURIComponent(truckId)}`
      );

      setList(res.data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const truckId = truck?.truckId;
    if (!truckId) return alert("Truck belum terbaca");

    try {
      setSubmitting(true);

      if (mode === "TARA_GUDANG") {
        await axios.put(
          `${BASE_URL}/api/gudang/tara/${encodeURIComponent(truckId)}`,
          { tara_gudang: Number(form.tara_gudang) }
        );

        setForm((p) => ({ ...p, tara_gudang: "" }));
      }

      if (mode === "BRUTO_GUDANG") {
        await axios.put(
          `${BASE_URL}/api/gudang/bruto/${encodeURIComponent(truckId)}`,
          { bruto_gudang: Number(form.bruto_gudang) }
        );

        setForm((p) => ({ ...p, bruto_gudang: "" }));
      }

      await syncStatus(truckId);
      await fetchData(truckId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal proses timbang gudang");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-green-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        ⚖️ Timbang Gudang System
      </h1>

      <p className="text-center mb-4 font-semibold">
        Mode: {mode}
      </p>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {!truck && !loading && (
        <p className="text-center text-gray-600">
          Menunggu RFID scan...
        </p>
      )}

      {truck && (
        <div className="max-w-5xl mx-auto bg-white p-6 shadow rounded">

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><b>Truck ID:</b> {truck.truckId}</div>
            <div><b>Driver:</b> {truck.driver}</div>
            <div><b>Tipe:</b> {truck.truckType}</div>
            <div><b>Tanggal:</b> {truck.date?.split("T")[0]}</div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            {mode === "TARA_GUDANG" && (
              <input
                type="number"
                name="tara_gudang"
                placeholder="Tara Gudang"
                value={form.tara_gudang}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            )}

            {mode === "BRUTO_GUDANG" && (
              <input
                type="number"
                name="bruto_gudang"
                placeholder="Bruto Gudang"
                value={form.bruto_gudang}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            )}

            {mode === "DONE" && (
              <div className="col-span-2 text-center text-green-700 font-bold">
                ✔ Timbang Gudang Selesai
              </div>
            )}

            <div className="col-span-2 flex justify-end gap-3 mt-3">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-400 px-4 py-2 rounded text-white"
              >
                Kembali
              </button>

              <button
                disabled={submitting || mode === "DONE"}
                className="bg-green-600 px-4 py-2 rounded text-white"
              >
                {submitting ? "Proses..." : "Simpan"}
              </button>

            </div>

          </form>

          {/* TABLE */}
          <div className="mt-10">
            <h2 className="font-bold mb-3">Riwayat Timbang Gudang</h2>

            <table className="w-full border text-sm">
              <thead className="bg-green-200">
                <tr>
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Tara</th>
                  <th className="border p-2">Bruto</th>
                  <th className="border p-2">Netto</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {list.length > 0 ? (
                  list.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2">{item.itemType}</td>
                      <td className="border p-2">{item.tara_gudang ?? 0}</td>
                      <td className="border p-2">{item.bruto_gudang ?? 0}</td>
                      <td className="border p-2 font-bold">{item.netto_gudang ?? 0}</td>
                      <td className="border p-2">{item.status_timbang}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      Belum ada data gudang
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

        </div>
      )}
    </div>
  );
};

export default TimbangGudang;