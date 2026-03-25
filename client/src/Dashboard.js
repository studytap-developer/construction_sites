import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    sites: 0,
    vendors: 0,
    workers: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0,
    vendorList: [],
    siteList: [],
  });

  const API = "http://localhost:8000/api";

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/sites`);
      const sites = res.data;

      let totalSites = sites.length;
      let totalVendors = 0;
      let totalWorkers = 0;
      let totalPaid = 0;
      let totalPending = 0;
      let totalAmount = 0;
      let vendorNames = [];

      sites.forEach((site) => {
        site.vendors?.forEach((vendor) => {
          totalVendors++;
          vendorNames.push(vendor.name);

          vendor.workers?.forEach((worker) => {
            totalWorkers++;

            totalAmount += worker.amount || 0; // ✅ NEW

            totalPaid += worker.paid || 0;

            const pending =
              (worker.amount || 0) - (worker.paid || 0);

            totalPending += pending;
          });
        });
      });

      setStats({
        sites: totalSites,
        vendors: totalVendors,
        workers: totalWorkers,
        totalPaid,
        totalPending,
        totalAmount, // ✅ NEW
        vendorList: vendorNames,
        siteList: sites.map((s) => s.name),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-100 via-white to-slate-200 min-h-screen">
      {/* HEADER */}
 

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card
          title="Total Sites"
          value={stats.sites}
          icon="🏗️"
          color="bg-gradient-to-br from-cyan-100 to-blue-200 border-transparent"
          textColor="text-slate-900"
        />
        <Card
          title="Total Vendors"
          value={stats.vendors}
          icon="👷"
          color="bg-gradient-to-br from-gray-100 to-gray-200 border-transparent"
          textColor="text-slate-900"
        />
        <Card
          title="Total Works"
          value={stats.workers}
          icon="👥"
          color="bg-gradient-to-br from-violet-100 to-fuchsia-200 border-transparent"
          textColor="text-slate-900"
        />

        <Card
          title="Total Amount"
          value={`₹${stats.totalAmount}`}
          icon="💰"
          color="bg-gradient-to-br from-indigo-100 to-indigo-200 border-transparent"
          textColor="text-slate-900"
        />

        <Card
          title="Total Paid"
          value={`₹${stats.totalPaid}`}
          icon="✅"
          color="bg-gradient-to-br from-emerald-100 to-emerald-200 border-transparent"
          textColor="text-slate-900"
        />

        <Card
          title="Pending Amount"
          value={`₹${stats.totalPending}`}
          icon="⏳"
          color="bg-gradient-to-br from-orange-100 to-amber-200 border-transparent"
          textColor="text-slate-900"
        />
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sites */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🏗️</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Sites</h2>
          </div>

          {stats.siteList.length === 0 ? (
            <p className="text-slate-500 text-sm">No sites available</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {stats.siteList.map((name, i) => (
                <li
                  key={i}
                  className="text-sm bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-slate-700"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vendors */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">👷</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Vendors</h2>
          </div>

          {stats.vendorList.length === 0 ? (
            <p className="text-slate-500 text-sm">No vendors available</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {stats.vendorList.map((name, i) => (
                <li
                  key={i}
                  className="text-sm bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-slate-700"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center">
        <p className="text-slate-500 font-medium">
          Advanced reporting and KPI analytics coming soon. You're building a smart construction command center.
        </p>
      </div>
    </div>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ title, value, icon, color, textColor }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${color || "bg-white border-slate-200"}`}>
      <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-500 hover:opacity-10" />
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-slate-500 text-sm font-semibold">{title}</h2>
          <p className={`text-2xl font-extrabold mt-2 ${textColor || "text-slate-900"}`}>
            {value}
          </p>
        </div>
        <div className="text-3xl opacity-85">{icon}</div>
      </div>
    </div>
  );
}
