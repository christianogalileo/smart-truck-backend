import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ⚡ Role default User, tidak bisa dipilih
  const role = 'User';

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password dan Confirm Password tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrasi berhasil! Silakan login.");
        navigate("/login");
      } else {
        alert(data.message || "Registrasi gagal!");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Terjadi kesalahan saat registrasi, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{
        background: `linear-gradient(
          135deg,
          #ffb07a 0%,
          #BE6316 28%,
          #076169 71%,
          #033c3b 100%
        )`
      }}
    >

      {/* Gambar truck animasi bounce */}
      <img
        src="/images/truck.png"
        alt="Truck"
        className="hidden md:block absolute left-10 bottom-10 w-48 opacity-30 select-none pointer-events-none animate-bounce"
      />

      {/* Card dengan animasi fade-in & slide-up */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8 z-10"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Register</h2>

        <form className="space-y-5" onSubmit={handleRegister}>
          {/* Role tidak bisa diubah, hanya tampil */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Role</label>
            <input
              type="text"
              value={role}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full bg-purple-600 text-white py-3 rounded-lg font-semibold transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Register'}
          </motion.button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <a href="/login" className="text-purple-600 hover:underline">
            Login di sini
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
