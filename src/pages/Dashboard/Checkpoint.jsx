import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Checkpoint = ({ role }) => {
  const userRole = role || "User";
  const apiUrl = "http://localhost:5000";

  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCheckpoints = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${apiUrl}/api/checkpoints`);

      if (!res.ok) {
        throw new Error("Failed to fetch checkpoint");
      }

      const data = await res.json();

      const order = {
        "Checkpoint 1": 1,
        "Checkpoint 2": 2,
        "Checkpoint 3": 3,
        "Checkpoint 4": 4,
      };

      data.sort(
        (a, b) =>
          (order[a.checkpoint] || 99) -
            (order[b.checkpoint] || 99) ||
          new Date(a.timestamp) - new Date(b.timestamp)
      );

      setCheckpoints(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data checkpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();

    const interval = setInterval(fetchCheckpoints, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex min-h-screen bg-fixed bg-cover bg-center"
      style={{
        background:
          "linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)",
      }}
    >
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/admin.png"
              alt="User"
              className="rounded-full mb-2"
            />
            <h2 className="font-semibold text-lg">{userRole}</h2>
          </div>

          <nav className="space-y-6">
            <Link
              to="/master-data"
              className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white"
            >
              Master Data
            </Link>

            {(userRole === "Admin" ||
              userRole === "Super Admin") && (
              <Link
                to="/info-driver"
                className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white"
              >
                Info Driver
              </Link>
            )}

            <Link
              to="/checkpoint"
              className="block bg-blue-700 hover:bg-blue-600 rounded-lg p-3 text-center"
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
            className="block bg-gray-700 rounded-lg p-3 text-center hover:text-white"
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

            <span className="text-lg font-medium text-gray-700">
              / Checkpoint
            </span>
          </div>
        </header>

        {loading && (
          <div className="mb-4 bg-yellow-100 text-yellow-700 p-3 rounded">
            Loading checkpoint...
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Checkpoint Logs
            </h2>

            <span className="text-gray-500 text-sm">
              Auto Refresh 2 detik
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">
                    Truck ID
                  </th>

                  <th className="border border-gray-300 p-2">
                    Plat Nomor
                  </th>

                  <th className="border border-gray-300 p-2">
                    Truck Type
                  </th>

                  <th className="border border-gray-300 p-2">
                    Driver
                  </th>

                  <th className="border border-gray-300 p-2">
                    Checkpoint
                  </th>

                  <th className="border border-gray-300 p-2">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {checkpoints.length > 0 ? (
                  checkpoints.map((cp) => (
                    <tr
                      key={cp.id}
                      className="hover:bg-gray-100"
                    >
                      <td className="border border-gray-300 p-2">
                        {cp.truckId}
                      </td>

                      <td className="border border-gray-300 p-2">
                        {cp.plateNumber || "-"}
                      </td>

                      <td className="border border-gray-300 p-2">
                        {cp.truckType}
                      </td>

                      <td className="border border-gray-300 p-2">
                        {cp.driver}
                      </td>

                      <td className="border border-gray-300 p-2 font-semibold">
                        {cp.checkpoint}
                      </td>

                      <td className="border border-gray-300 p-2">
                        {new Date(cp.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-5 text-gray-500"
                    >
                      Tidak ada data checkpoint
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Checkpoint;