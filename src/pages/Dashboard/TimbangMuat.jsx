import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const TimbangMuat = () => {
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const [mode, setMode] = useState("BRUTO");

  const [activeId, setActiveId] = useState(null);

  const [form, setForm] = useState({
    itemType: "",
    no_palka: "",
    bruto_belawan: "",
    tara_belawan: "",
  });

  // ================= RFID =================
  const fetchRFID = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/rfid/latest");
      const truckData = res.data?.truck;

      if (!truckData?.truckId) {
        setTruck(null);
        return;
      }

      setTruck(truckData);
      await syncState(truckData.truckId);
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

  // ================= SYNC STATE (FIXED LOGIC) =================
  const syncState = async (truckId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/loadings/${truckId}`
      );

      const data = res.data?.[0];

      if (!data) {
        setMode("BRUTO");
        setActiveId(null);
        return;
      }

      // 🔥 kalau masih BRUTO → lanjut TARA
      if (data.status_timbang === "BRUTO") {
        setMode("TARA");
        setActiveId(data.id);

        setForm({
          itemType: data.itemType,
          no_palka: data.no_palka,
          bruto_belawan: data.bruto_belawan,
          tara_belawan: "",
        });
      } else {
        setMode("BRUTO");
        setActiveId(null);

        setForm({
          itemType: "",
          no_palka: "",
          bruto_belawan: "",
          tara_belawan: "",
        });
      }

      setList(res.data || []);
    } catch (err) {
      setMode("BRUTO");
      setActiveId(null);
      setList([]);
    }
  };

  // ================= HANDLE =================
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
    if (!truckId) return alert("RFID belum terbaca!");

    try {
      // ================= BRUTO =================
      if (mode === "BRUTO") {
        if (!form.itemType || !form.no_palka || !form.bruto_belawan) {
          return alert("Item, No Palka, Bruto wajib diisi");
        }

        const res = await axios.post(
          "http://localhost:5000/api/loadings",
          {
            truckId,
            itemType: form.itemType,
            no_palka: form.no_palka,
            bruto_belawan: Number(form.bruto_belawan),
            unit: "kg",
          }
        );

        setActiveId(res.data.id); // 🔥 kunci transaksi

        alert("Bruto tersimpan");

        await syncState(truckId);
      }

      // ================= TARA =================
      else {
        if (!form.tara_belawan) {
          return alert("Tara wajib diisi");
        }

        await axios.put(
          `http://localhost:5000/api/loadings/tara/${truckId}`,
          {
            tara_belawan: Number(form.tara_belawan),
          }
        );

        alert("Tara tersimpan (SELESAI)");

        setActiveId(null);

        setForm({
          itemType: "",
          no_palka: "",
          bruto_belawan: "",
          tara_belawan: "",
        });

        await syncState(truckId);
      }
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Gagal proses timbang");
    }
  };

  // ================= FETCH DATA =================
  const fetchData = async (truckId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/loadings/${truckId}`
      );

      setList(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-2">
        ⚖️ Timbang Muat System
      </h1>

      <p className="text-center mb-6 font-semibold">
        Mode: {mode === "BRUTO" ? "INPUT BRUTO" : "INPUT TARA"}
      </p>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {!truck && !loading && (
        <p className="text-center text-gray-600">Menunggu RFID...</p>
      )}

      {truck && (
        <div className="max-w-6xl mx-auto bg-white p-6 shadow rounded">

          {/* INFO */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div><b>Truck:</b> {truck.truckId}</div>
            <div><b>Driver:</b> {truck.driver}</div>
            <div><b>Tipe:</b> {truck.truckType}</div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <input
              name="itemType"
              value={form.itemType}
              onChange={handleChange}
              disabled={mode === "TARA"}
              placeholder="Item"
              className="border p-2"
            />

            <input
              name="no_palka"
              value={form.no_palka}
              onChange={handleChange}
              disabled={mode === "TARA"}
              placeholder="No Palka"
              className="border p-2"
            />

            {mode === "BRUTO" ? (
              <input
                name="bruto_belawan"
                value={form.bruto_belawan}
                onChange={handleChange}
                type="number"
                placeholder="Bruto"
                className="border p-2"
              />
            ) : (
              <input
                name="tara_belawan"
                value={form.tara_belawan}
                onChange={handleChange}
                type="number"
                placeholder="Tara"
                className="border p-2"
              />
            )}

            <div className="border p-2 bg-gray-100">
              Netto:{" "}
              {mode === "BRUTO"
                ? 0
                : Number(form.bruto_belawan || 0) -
                  Number(form.tara_belawan || 0)}
            </div>

            <button
              type="submit"
              className="col-span-2 bg-blue-600 text-white p-2"
            >
              {mode === "BRUTO" ? "Simpan Bruto" : "Simpan Tara"}
            </button>

          </form>

          {/* TABLE */}
          <div className="mt-10">
            <table className="w-full border text-sm">
              <thead className="bg-blue-200">
                <tr>
                  <th>Item</th>
                  <th>No Palka</th>
                  <th>Bruto</th>
                  <th>Tara</th>
                  <th>Netto</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemType}</td>
                    <td>{item.no_palka}</td>
                    <td>{item.bruto_belawan}</td>
                    <td>{item.tara_belawan}</td>
                    <td className="font-bold">{item.netto_belawan}</td>
                    <td>{item.status_timbang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default TimbangMuat;