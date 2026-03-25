
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "dashboard", icon: "📊" },
    { name: "Sites", path: "sites", icon: "🏗️" },
    { name: "Bills", path: "bills", icon: "🧾" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  const getTitle = () => {
    if (location.pathname.includes("sites")) return "🏗️ Sites Management";
    if (location.pathname.includes("bills")) return "🧾 Bills & Expenses";
    return "📊 Dashboard";
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      
      {/* 🔥 Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 h-screen bg-gradient-to-b from-gray-900 to-black text-white transform flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 
        lg:translate-x-0 lg:static lg:block lg:h-screen`}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="p-6 text-2xl font-extrabold border-b border-gray-800 cursor-pointer hover:bg-gray-800 flex items-center gap-2"
        >
          <span className="text-yellow-400">🏗️</span>
          <span>BuildPro</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          {menu.map((item) => {
            const active = location.pathname.includes(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)} // close on mobile click
                className={`block px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  active
                    ? "bg-yellow-500 text-black font-semibold shadow"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-gray-800 text-sm text-gray-500">
          © 2026 Shree Gajanana Enterprises LLP
        </div>
      </div>

      {/* 🔥 Overlay (Mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 🔥 Main Content */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Topbar */}
        <div className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6">
          
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* ☰ Menu Button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-2xl"
            >
              ☰
            </button>

            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              {getTitle()}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-gray-600 hidden md:block">
              Welcome, Admin
            </span>


            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition shadow text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
