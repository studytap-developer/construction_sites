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
    <div className="p-6 bg-gray-100 min-h-screen">
      
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
        <Card title="Total Sites" value={stats.sites} />
        <Card title="Total Vendors" value={stats.vendors} />
        <Card title="Total Works" value={stats.workers} />

        <Card
          title="Total Amount"
          value={`₹${stats.totalAmount}`}
          color="text-blue-600"
        />

        <Card
          title="Total Paid"
          value={`₹${stats.totalPaid}`}
          color="text-green-600"
        />

        <Card
          title="Pending Amount"
          value={`₹${stats.totalPending}`}
          color="text-red-600"
        />
      </div>

      {/* LOWER SECTION */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 🏗️ Sites */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">🏗️ Sites</h2>

          {stats.siteList.length === 0 ? (
            <p className="text-gray-500 text-sm">No sites</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {stats.siteList.map((name, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-50 px-3 py-2 rounded"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 👷 Vendors */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">👷 Vendors</h2>

          {stats.vendorList.length === 0 ? (
            <p className="text-gray-500 text-sm">No vendors</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {stats.vendorList.map((name, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-50 px-3 py-2 rounded"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 bg-white p-5 rounded-xl shadow text-center">
        <p className="text-gray-400">
          📈 More analytics features coming soon...
        </p>
      </div>
    </div>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className={`text-2xl font-bold mt-2 ${color || ""}`}>
        {value}
      </p>
    </div>
  );
}
