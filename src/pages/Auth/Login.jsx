// pages/Auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Ambil URL backend dari .env
  const API_URL = process.env.REACT_APP_API_URL || "http://38.147.122.240:5000";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Email dan password wajib diisi");
      return;
    }

    try {
      console.log("API URL :", API_URL);

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);

        setUserRole(data.user.role);

        alert(`Login berhasil sebagai ${data.user.role}`);

        navigate("/dashboard", {
          replace: true,
        });
      } else {
        alert(data.message || "Email atau password salah");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/images/bg-login.jpeg')",
        backgroundSize: "80%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="text-blue-500 font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;