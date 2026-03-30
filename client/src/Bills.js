// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Bills() {
//   const [bills, setBills] = useState([]);
//   const [selectedImg, setSelectedImg] = useState(null);
//   const [search, setSearch] = useState("");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [billToDelete, setBillToDelete] = useState(null);

//   const API = process.env.REACT_APP_API_URL || "https://construction-sites-b5y5.onrender.com/api";
//   const backendBase = API.replace(/\/api\/?$/, "");
//  // const API = "https://construction-sites-1.onrender.com/api";

//   // Fetch all bills
//   const fetchBills = async () => {
//     const res = await axios.get(`${API}/bills`);
//     setBills(res.data);
//   };

//   useEffect(() => {
//     fetchBills();
//   }, []);

//   // Download bill
//   const handleDownload = async (url) => {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const link = document.createElement("a");
//     link.href = window.URL.createObjectURL(blob);
//     link.download = "bill.jpg";
//     link.click();
//   };

//   // Open modal to confirm delete
//   const confirmDelete = (bill) => {
//     setBillToDelete(bill);
//     setShowDeleteModal(true);
//   };

//   // Delete bill after confirmation
//   const handleDeleteConfirmed = async () => {
//     if (!billToDelete) return;

//     try {
//       await axios.delete(
//         `${API}/sites/${billToDelete.siteId}/vendors/${billToDelete.vendorIndex}/workers/${billToDelete.workerIndex}/delete-bill`,
//         { params: { path: billToDelete.bill } }
//       );

//       // Remove from state
//       setBills((prev) =>
//         prev.filter(
//           (b) =>
//             !(
//               b.siteId === billToDelete.siteId &&
//               b.vendorIndex === billToDelete.vendorIndex &&
//               b.workerIndex === billToDelete.workerIndex &&
//               b.bill === billToDelete.bill
//             )
//         )
//       );
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setShowDeleteModal(false);
//       setBillToDelete(null);
//     }
//   };

//   // Filter bills based on search
//   const filteredBills = bills.filter((bill) =>
//     bill.siteName.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-4">🧾 Bills</h1>

//       {/* SEARCH */}
//       <input
//         type="text"
//         placeholder="Search by site name..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="w-full md:w-1/3 mb-6 px-4 py-2 border rounded-lg"
//       />

//       {/* BILL LIST */}
//       {filteredBills.length === 0 ? (
//         <p>No matching bills found</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[520px] overflow-y-auto">
//           {filteredBills.map((bill, index) => {
//             const imageUrl =
//               typeof bill.bill === "string"
//                 ? bill.bill.startsWith("http")
//                   ? bill.bill
//                   : `${backendBase}${bill.bill}`
//                 : "";

//             return (
//               <div key={index} className="bg-white p-4 rounded-xl shadow">
//                 {/* BILL IMAGE */}
//                 <div
//                   className="w-full h-48 flex items-center justify-center bg-gray-100 rounded mb-3 cursor-pointer"
//                   onClick={() => setSelectedImg(imageUrl)}
//                 >
//                   <img
//                     src={imageUrl}
//                     alt="bill"
//                     className="max-h-full object-contain"
//                   />
//                 </div>

//                 {/* BILL DETAILS */}
//                 <h2 className="font-semibold text-lg">{bill.siteName}</h2>
//                 <p className="text-sm">Vendor: {bill.vendorName}</p>
//                 <p className="text-sm">Worker: {bill.workerName}</p>
//                 <p className="text-sm">Work: {bill.work}</p>
//                 <p className="text-sm font-semibold mt-2">
//                   Paid ₹{bill.paid} / Pending ₹{bill.amount}
//                 </p>

//                 {/* ACTION BUTTONS */}
//                 <div className="flex gap-4 mt-3 text-sm">
//                   <button
//                     onClick={() => handleDownload(imageUrl)}
//                     className="text-blue-600"
//                   >
//                     Download
//                   </button>

//                   <a
//                     href={`https://wa.me/?text=${encodeURIComponent(
//                       `Bill: ${imageUrl}`
//                     )}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-green-600"
//                   >
//                     WhatsApp
//                   </a>

//                   <button
//                     onClick={() => confirmDelete(bill)}
//                     className="text-red-600"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* IMAGE ZOOM */}
//       {selectedImg && (
//         <div
//           className="fixed inset-0 bg-black/80 flex items-center justify-center z-40"
//           onClick={() => setSelectedImg(null)}
//         >
//           <img
//             src={selectedImg}
//             alt="zoom"
//             className="max-h-[90%] max-w-[90%]"
//           />
//         </div>
//       )}

//       {/* DELETE CONFIRMATION MODAL */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//           <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
//             <p className="mb-4 text-lg font-semibold">
//               Are you sure you want to delete this bill?
//             </p>
//             <div className="flex justify-between gap-4">
//               <button
//                 onClick={handleDeleteConfirmed}
//                 className="bg-red-600 text-white px-4 py-2 rounded-lg"
//               >
//                 Delete
//               </button>
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="bg-gray-300 px-4 py-2 rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import axios from "axios";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  const API =
    process.env.REACT_APP_API_URL ||
    "https://construction-sites-b5y5.onrender.com/api";

  const backendBase = API.replace(/\/api\/?$/, "");

  // ✅ FETCH BILLS FROM /sites (FIXED)
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API}/sites`);

      const allBills = [];

      res.data.forEach((site) => {
        site.vendors?.forEach((vendor, vIndex) => {
          vendor.workers?.forEach((worker, wIndex) => {
            const billsArray = Array.isArray(worker.bill)
              ? worker.bill
              : worker.bill
              ? [worker.bill]
              : [];

            billsArray.forEach((b) => {
              allBills.push({
                bill: b,
                siteId: site._id,
                vendorIndex: vIndex,
                workerIndex: wIndex,
                siteName: site.name,
                vendorName: vendor.name,
                workerName: worker.name,
                work: worker.work,
                paid: worker.paid,
                amount: worker.amount,
              });
            });
          });
        });
      });

      setBills(allBills);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ✅ DOWNLOAD
  const handleDownload = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "bill.jpg";
    link.click();
  };

  // ✅ DELETE CONFIRM
  const confirmDelete = (bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  // ✅ DELETE BILL
  const handleDeleteConfirmed = async () => {
    if (!billToDelete) return;

    try {
      await axios.delete(
        `${API}/sites/${billToDelete.siteId}/vendors/${billToDelete.vendorIndex}/workers/${billToDelete.workerIndex}/delete-bill`,
        { params: { path: billToDelete.bill } }
      );

      setBills((prev) =>
        prev.filter(
          (b) =>
            !(
              b.siteId === billToDelete.siteId &&
              b.vendorIndex === billToDelete.vendorIndex &&
              b.workerIndex === billToDelete.workerIndex &&
              b.bill === billToDelete.bill
            )
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setBillToDelete(null);
    }
  };

  // ✅ SEARCH FILTER
  const filteredBills = bills.filter((bill) =>
    bill.siteName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🧾 Bills</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by site name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 mb-6 px-4 py-2 border rounded-lg"
      />

      {/* LIST */}
      {filteredBills.length === 0 ? (
        <p>No bills found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[520px] overflow-y-auto">
          {filteredBills.map((bill, index) => {
            const imageUrl =
              typeof bill.bill === "string"
                ? bill.bill.startsWith("http")
                  ? bill.bill
                  : `${backendBase}${bill.bill}`
                : "";

            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow">
                {/* IMAGE */}
                <div
                  className="w-full h-48 flex items-center justify-center bg-gray-100 rounded mb-3 cursor-pointer"
                  onClick={() => setSelectedImg(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt="bill"
                    className="max-h-full object-contain"
                  />
                </div>

                {/* DETAILS */}
                <h2 className="font-semibold text-lg">{bill.siteName}</h2>
                <p className="text-sm">Vendor: {bill.vendorName}</p>
                <p className="text-sm">Worker: {bill.workerName}</p>
                <p className="text-sm">Work: {bill.work}</p>
                <p className="text-sm font-semibold mt-2">
                  Paid ₹{bill.paid} / Total ₹{bill.amount}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-4 mt-3 text-sm">
                  <button
                    onClick={() => handleDownload(imageUrl)}
                    className="text-blue-600"
                  >
                    Download
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Bill: ${imageUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600"
                  >
                    WhatsApp
                  </a>

                  <button
                    onClick={() => confirmDelete(bill)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IMAGE ZOOM */}
      {selectedImg && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            alt="zoom"
            className="max-h-[90%] max-w-[90%]"
          />
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="mb-4 text-lg font-semibold">
              Are you sure you want to delete this bill?
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}