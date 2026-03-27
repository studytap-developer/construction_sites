import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // Removed unused `res` to fix ESLint warning
      // await axios.post("http://localhost:8000/api/login", {
            await axios.post("https://construction-sites-1.onrender.com/api/login", {

        username,
        password,
      });

      // ✅ SAVE LOGIN STATE
      localStorage.setItem("auth", "true");

      navigate("/app/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Main Content */}
      <div className="relative text-center text-white">
        {!showLogin ? (
          <>
            <h1 className="text-4xl font-bold mb-4">
              Construction Management System
            </h1>

            <p className="text-gray-300 mb-8">
              Build smarter. Manage better.
            </p>

            <button
              onClick={() => setShowLogin(true)}
              className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[320px]">
            <h2 className="text-2xl font-bold mb-6">Login</h2>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
            />

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded-lg font-semibold transition"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

