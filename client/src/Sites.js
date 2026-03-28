

import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Sites() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const [currentSite, setCurrentSite] = useState(null);
  const [currentVendorIndex, setCurrentVendorIndex] = useState(null);
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(null);

  const fileRef = useRef();
  const [uploadContext, setUploadContext] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [uploadMessage, setUploadMessage] = useState(""); // ✅ Success or Error message

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    details: "",
    phone: "",
    work: "",
    amount: "",
  });

  // const API = "http://localhost:8000/api";

  // const API = "https://construction-sites-1.onrender.com/api";
  const API = "https://construction-sites-b5y5.onrender.com/api";  
  const fetchSites = async () => {
    const res = await axios.get(`${API}/sites`);
    setSites(res.data);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // ================= MODAL =================
  const openModal = (
    type,
    site = null,
    vIndex = null,
    wIndex = null,
    worker = null,
  ) => {
    setModalType(type);
    setCurrentSite(site);
    setCurrentVendorIndex(vIndex);
    setCurrentWorkerIndex(wIndex);

    if (type === "editSite") {
      setFormData({
        name: site.name,
        location: site.location,
        details: site.details,
      });
    } else if (type === "editVendor") {
      const vendor = site.vendors[vIndex];
      setFormData({ name: vendor.name, phone: vendor.phone });
    } else if (type === "editWorker" || type === "pay") {
      setFormData({
        name: worker.name,
        work: worker.work,
        amount: worker.amount,
      });
    } else {
      setFormData({
        name: "",
        location: "",
        details: "",
        phone: "",
        work: "",
        amount: "",
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    if (modalType === "addSite") await axios.post(`${API}/sites`, formData);
    if (modalType === "editSite")
      await axios.put(`${API}/sites/${currentSite._id}`, formData);
    if (modalType === "addVendor")
      await axios.post(`${API}/sites/${currentSite._id}/vendors`, formData);
    if (modalType === "editVendor")
      await axios.put(
        `${API}/sites/${currentSite._id}/vendors/${currentVendorIndex}`,
        formData,
      );
    if (modalType === "addWorker")
      await axios.post(
        `${API}/sites/${currentSite._id}/vendors/${currentVendorIndex}/workers`,
        formData,
      );
    if (modalType === "editWorker")
      await axios.put(
        `${API}/sites/${currentSite._id}/vendors/${currentVendorIndex}/workers/${currentWorkerIndex}`,
        formData,
      );
    if (modalType === "pay")
      await axios.post(
        `${API}/sites/${currentSite._id}/vendors/${currentVendorIndex}/workers/${currentWorkerIndex}/pay`,
        { amount: formData.amount },
      );

    closeModal();
    fetchSites();
  };

  // ================= DELETE CONFIRMATION MODAL =================

  // ================= DELETE CONFIRMATION MODAL =================
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState(null);
  // deleteContext = { type: "site"|"vendor"|"worker", siteId, vIndex?, wIndex? }

  const confirmDelete = (context) => {
    setDeleteContext(context);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteContext) return;

    const { type, siteId, vIndex, wIndex } = deleteContext;

    try {
      if (type === "site") await axios.delete(`${API}/sites/${siteId}`);
      if (type === "vendor")
        await axios.delete(`${API}/sites/${siteId}/vendors/${vIndex}`);
      if (type === "worker")
        await axios.delete(
          `${API}/sites/${siteId}/vendors/${vIndex}/workers/${wIndex}`,
        );
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setDeleteContext(null);
      fetchSites();
    }
  };

  // ================= DELETE =================
  // const deleteSite = async (id) => {
  //   await axios.delete(`${API}/sites/${id}`);
  //   fetchSites();
  // };

  // const deleteVendor = async (siteId, vIndex) => {
  //   await axios.delete(`${API}/sites/${siteId}/vendors/${vIndex}`);
  //   fetchSites();
  // };

  // const deleteWorker = async (siteId, vIndex, wIndex) => {
  //   await axios.delete(
  //     `${API}/sites/${siteId}/vendors/${vIndex}/workers/${wIndex}`,
  //   );
  //   fetchSites();
  // };
  //==============upload===============

  const handleUploadClick = (siteId, vIndex, wIndex) => {
    setUploadContext({ siteId, vIndex, wIndex });
    fileRef.current.click();
  };

  const showUploadToast = (msg) => {
    setUploadMessage(msg);
    setUploadModalOpen(true);
    setTimeout(() => setUploadModalOpen(false), 2500);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !uploadContext) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("bill", file));

    try {
      await axios.post(
        `${API}/sites/${uploadContext.siteId}/vendors/${uploadContext.vIndex}/workers/${uploadContext.wIndex}/upload-bill`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      showUploadToast(`Bill${files.length > 1 ? "s" : ""} uploaded ✅`);
      fetchSites();
    } catch (err) {
      console.error(err);
      showUploadToast("Upload failed ❌");
    } finally {
      e.target.value = "";
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-6">🏗️ Sites Dashboard</h1>

        <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => openModal("addSite")}
      >
        + Add Site
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => (
          <div key={site._id} className="bg-white rounded shadow h-full flex flex-col overflow-hidden w-full">
            {/* SITE HEADER */}
            <div
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/app/sites/${site._id}`)}
            >
              <div>
                <h2 className="text-xl font-semibold">{site.name}</h2>
                <p className="text-gray-500">{site.location}</p>
              </div>

              <div className="space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal("editSite", site);
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete({ type: "site", siteId: site._id });
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Vendors/details moved to site detail screen */}
          </div>
        ))}      </div>

      {/* MODAL */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6"
      >
        <Dialog.Panel className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg relative shadow-lg">
          <button onClick={closeModal} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100">
            <X />
          </button>

          <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
            {modalType === "addWorker"
              ? "Add Work"
              : modalType === "editWorker"
                ? "Edit Work"
                : modalType === "pay"
                  ? "Pay Worker"
                  : modalType.includes("add")
                    ? "Add"
                    : "Edit"}
          </h2>

          <div className="space-y-2">
            {(modalType === "addSite" || modalType === "editSite") && (
              <>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Details"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                />
              </>
            )}

            {(modalType === "addVendor" || modalType === "editVendor") && (
              <>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </>
            )}

            {(modalType === "addWorker" || modalType === "editWorker") && (
              <>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Work"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Details"
                  value={formData.work}
                  onChange={(e) =>
                    setFormData({ ...formData, work: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </>
            )}

            {modalType === "pay" && (
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Payment Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded mt-4"
          >
            Submit
          </button>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <Dialog.Panel className="bg-white p-6 rounded w-full max-w-xs sm:max-w-sm text-center">
          <p className="mb-4 text-lg font-semibold">
            Are you sure you want to delete?
          </p>
          <div className="flex justify-between gap-4">
            <button
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* UPLOAD FEEDBACK TOAST */}
      {uploadModalOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 shadow-lg text-center text-sm text-blue-800">
          {uploadMessage}
        </div>
      )}
    </div>
  </div>
  );
}

export function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [activeVendor, setActiveVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const API = "http://localhost:8000/api";
  const API = "https://construction-sites-b5y5.onrender.com/api";

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentVendorIndex, setCurrentVendorIndex] = useState(null);
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileRef = useRef();
  const [uploadContext, setUploadContext] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    details: "",
    phone: "",
    work: "",
    amount: "",
  });

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await axios.get(`${API}/sites/${id}`);
        setSite(res.data);
      } catch (err) {
        setError("Unable to fetch site details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  const fetchSite = async () => {
    try {
      const res = await axios.get(`${API}/sites/${id}`);
      setSite(res.data);
    } catch (err) {
      setError("Unable to fetch site details.");
    }
  };

  const openModal = (type, vIndex = null, wIndex = null, worker = null) => {
    setModalType(type);
    setCurrentVendorIndex(vIndex);
    setCurrentWorkerIndex(wIndex);

    if (type === "editVendor") {
      const vendor = site.vendors[vIndex];
      setFormData({ name: vendor.name, phone: vendor.phone });
    } else if (type === "editWorker" || type === "pay") {
      setFormData({
        name: worker.name,
        work: worker.work,
        amount: worker.amount,
      });
    } else {
      setFormData({
        name: "",
        location: "",
        details: "",
        phone: "",
        work: "",
        amount: "",
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    try {
      if (modalType === "addVendor") {
        await axios.post(`${API}/sites/${id}/vendors`, formData);
      }
      if (modalType === "editVendor") {
        await axios.put(`${API}/sites/${id}/vendors/${currentVendorIndex}`, formData);
      }
      if (modalType === "addWorker") {
        await axios.post(`${API}/sites/${id}/vendors/${currentVendorIndex}/workers`, formData);
      }
      if (modalType === "editWorker") {
        await axios.put(`${API}/sites/${id}/vendors/${currentVendorIndex}/workers/${currentWorkerIndex}`, formData);
      }
      if (modalType === "pay") {
        await axios.post(`${API}/sites/${id}/vendors/${currentVendorIndex}/workers/${currentWorkerIndex}/pay`, {
          amount: formData.amount,
        });
      }

      closeModal();
      fetchSite();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (context) => {
    setDeleteContext(context);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteContext) return;

    const { type, vIndex, wIndex } = deleteContext;

    try {
      if (type === "vendor") {
        await axios.delete(`${API}/sites/${id}/vendors/${vIndex}`);
      }
      if (type === "worker") {
        await axios.delete(`${API}/sites/${id}/vendors/${vIndex}/workers/${wIndex}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setDeleteContext(null);
      fetchSite();
    }
  };

  const handleUploadClick = (vIndex, wIndex) => {
    setUploadContext({ vIndex, wIndex });
    fileRef.current.click();
  };

  const showUploadToast = (msg) => {
    setUploadMessage(msg);
    setUploadModalOpen(true);
    setTimeout(() => setUploadModalOpen(false), 2500);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !uploadContext) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("bill", file));

    try {
      await axios.post(
        `${API}/sites/${id}/vendors/${uploadContext.vIndex}/workers/${uploadContext.wIndex}/upload-bill`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      showUploadToast(`Bill${files.length > 1 ? "s" : ""} uploaded ✅`);
      fetchSite();
    } catch (err) {
      console.error(err);
      showUploadToast("Upload failed ❌");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <div className="p-6">Loading site details...</div>;

  if (error || !site)
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error || "Site not found."}</p>
        <button onClick={() => navigate("/app/sites")} className="bg-blue-600 text-white px-4 py-2 rounded">
          Back to sites
        </button>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-6">
        <button
          onClick={() => navigate("/app/sites")}
          className="mb-4 bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Back to sites
        </button>

        <h1 className="text-3xl font-bold mb-3">{site.name}</h1>
        <p className="text-gray-600 mb-1">Location: {site.location}</p>
        <p className="text-gray-600 mb-4">Details: {site.details}</p>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => openModal("addVendor")}
        >
          + Add Vendor
        </button>

        <div className="grid grid-cols-1 gap-4">
          {(site.vendors || []).map((vendor, vIndex) => (
            <div key={vIndex} className="bg-white p-4 rounded shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <h2
                  className={`text-xl font-semibold cursor-pointer ${
                    activeVendor === vIndex ? "text-blue-800" : "hover:text-blue-600"
                  }`}
                  onClick={() =>
                    setActiveVendor((prev) => (prev === vIndex ? null : vIndex))
                  }
                >
                  Vendor: {vendor.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal("editVendor", vIndex)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete({ type: "vendor", vIndex })}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-3">Phone: {vendor.phone || "N/A"}</p>

              {activeVendor === vIndex ? (
                <>
                  <button
                    className="bg-indigo-500 text-white px-3 py-1 rounded mb-3 text-sm"
                    onClick={() => openModal("addWorker", vIndex)}
                  >
                    + Add Work
                  </button>

                  {(vendor.workers || []).map((worker, wIndex) => {
                    const pending = worker.amount - worker.paid;
                    return (
                      <div key={wIndex} className="bg-gray-50 p-3 mb-3 rounded">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-semibold truncate">{worker.name}</p>
                            <p className="text-sm text-gray-600 truncate">Work: {worker.work}</p>
                            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
                              <span>Paid: ₹{worker.paid}</span>
                              <span>Total:₹{worker.amount}</span>
                            </div>
                            <p className={`text-xs mt-1 ${pending === 0 ? "text-green-700" : "text-red-700"}`}>
                              {pending === 0 ? "Paid" : `Pending ₹${pending}`}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-1">
                            <button
                              onClick={() => openModal("editWorker", vIndex, wIndex, worker)}
                              className="bg-yellow-400 text-white px-2 py-1 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openModal("pay", vIndex, wIndex, worker)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => confirmDelete({ type: "worker", vIndex, wIndex })}
                              className="bg-red-400 text-white px-2 py-1 rounded text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUploadClick(vIndex, wIndex)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Upload Bill
                        </button>

                        {(() => {
                          const bills =
                            Array.isArray(worker.bill) && worker.bill.length > 0
                              ? worker.bill
                              : worker.bill
                              ? [worker.bill]
                              : [];

                          if (bills.length === 0) return null;

                          return (
                            <div className="mt-2 bg-white p-2 rounded border">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Bills</p>
                              <div className="flex flex-wrap gap-2">
                                {bills.map((billUrl, bIdx) => {
                                  // const fullUrl = `http://localhost:8000${billUrl}`;
                                  const fullUrl = `https://construction-sites-b5y5.onrender.com${billUrl}`;
                                  return (
                                    <div key={bIdx} className="relative w-16 h-16 sm:w-20 sm:h-20 border rounded overflow-hidden">
                                      <img
                                        src={fullUrl}
                                        alt={`bill-${bIdx}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        onClick={async () => {
                                          try {
                                            await axios.delete(
                                              `${API}/sites/${site._id}/vendors/${vIndex}/workers/${wIndex}/delete-bill`,
                                              { params: { path: billUrl } },
                                            );
                                            showUploadToast("Bill deleted ✅");
                                            fetchSite();
                                          } catch (err) {
                                            console.error(err);
                                            showUploadToast("Delete failed ❌");
                                          }
                                        }}
                                        className="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 py-0.5"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {worker.payments && worker.payments.length > 0 && (
                          <div className="mt-2 bg-white p-2 rounded border">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Payment History</p>
                            {worker.payments.map((payment, idx) => (
                              <p key={idx} className="text-xs text-gray-700">
                                ₹{payment.amount} • {new Date(payment.date).toLocaleDateString()}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">Click vendor to show this vendor's workers</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6"
      >
        <Dialog.Panel className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg relative shadow-lg">
          <button onClick={closeModal} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100">
            <X />
          </button>

          <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
            {modalType === "addWorker"
              ? "Add Work"
              : modalType === "editWorker"
                ? "Edit Work"
                : modalType === "pay"
                  ? "Pay Worker"
                  : modalType.includes("add")
                    ? "Add"
                    : "Edit"}
          </h2>

          <div className="space-y-2">
            {(modalType === "addVendor" || modalType === "editVendor") && (
              <>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </>
            )}

            {(modalType === "addWorker" || modalType === "editWorker") && (
              <>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Work"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Details"
                  value={formData.work}
                  onChange={(e) =>
                    setFormData({ ...formData, work: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </>
            )}

            {modalType === "pay" && (
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Payment Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded mt-4"
          >
            Submit
          </button>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <Dialog.Panel className="bg-white p-6 rounded w-full max-w-xs sm:max-w-sm text-center">
          <p className="mb-4 text-lg font-semibold">
            Are you sure you want to delete?
          </p>
          <div className="flex justify-between gap-4">
            <button
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* UPLOAD FEEDBACK TOAST */}
      {uploadModalOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 shadow-lg text-center text-sm text-blue-800">
          {uploadMessage}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
}

export function VendorDetail() {
  const { id, vendorIndex } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [siteName, setSiteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileRef = useRef();
  const [uploadContext, setUploadContext] = useState(null);
  //const API = "http://localhost:8000/api";
     const API = "https://construction-sites-1.onrender.com/api";

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axios.get(`${API}/sites/${id}`);
        const siteData = res.data;
        setSiteName(siteData.name);

        const v = siteData.vendors?.[Number(vendorIndex)];
        if (!v) {
          setError("Vendor not found");
          return;
        }
        setVendor(v);
      } catch (err) {
        setError("Unable to fetch vendor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id, vendorIndex]);

  const showUploadToast = (msg) => {
    setUploadMessage(msg);
    setUploadModalOpen(true);
    setTimeout(() => setUploadModalOpen(false), 2500);
  };

  const handleUploadClick = (wIndex) => {
    setUploadContext({ wIndex });
    fileRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !uploadContext) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("bill", file));

    try {
      await axios.post(
        `${API}/sites/${id}/vendors/${vendorIndex}/workers/${uploadContext.wIndex}/upload-bill`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      showUploadToast(`Bill${files.length > 1 ? "s" : ""} uploaded ✅`);
      const res = await axios.get(`${API}/sites/${id}`);
      const siteData = res.data;
      setVendor(siteData.vendors?.[Number(vendorIndex)] || null);
    } catch (err) {
      console.error(err);
      showUploadToast("Upload failed ❌");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <div className="p-6">Loading vendor details...</div>;

  if (error || !vendor)
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error || "Vendor not found."}</p>
        <button onClick={() => navigate(`/app/sites/${id}`)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Back to site
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <button
          onClick={() => navigate(`/app/sites/${id}`)}
          className="mb-4 bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Back to site ({siteName})
        </button>

        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-2">Vendor: {vendor.name}</h1>
          <p className="text-gray-600 mb-3">Phone: {vendor.phone || "N/A"}</p>

          <h2 className="font-semibold mb-2">Workers</h2>
          {(vendor.workers || []).length === 0 && <p>No workers yet.</p>}

          {(vendor.workers || []).map((worker, idx) => {
            const pending = worker.amount - worker.paid;
            return (
              <div key={idx} className="bg-gray-50 p-3 mb-3 rounded border">
                <p className="font-semibold">{worker.name}</p>
                <p className="text-sm text-gray-600">Work: {worker.work}</p>
                <p className="text-sm">Paid: ₹{worker.paid} / Total: ₹{worker.amount}</p>
                <p className={`text-xs mt-1 ${pending === 0 ? "text-green-700" : "text-red-700"}`}>
                  {pending === 0 ? "Paid" : `Pending ₹${pending}`}
                </p>

                <button
                  onClick={() => handleUploadClick(idx)}
                  className="text-xs text-blue-600 hover:underline mt-2"
                >
                  Upload Bill
                </button>

                {(() => {
                  const bills =
                    Array.isArray(worker.bill) && worker.bill.length > 0
                      ? worker.bill
                      : worker.bill
                      ? [worker.bill]
                      : [];

                  if (bills.length === 0) return null;

                  return (
                    <div className="mt-2 bg-white p-2 rounded border">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Bills</p>
                      <div className="flex flex-wrap gap-2">
                        {bills.map((billUrl, bIdx) => {
                          const fullUrl = `https://construction-sites-1.onrender.com${billUrl}`;
                          return (
                            <div key={bIdx} className="relative w-20 h-20 border rounded overflow-hidden">
                              <img
                                src={fullUrl}
                                alt={`bill-${bIdx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.delete(
                                      `${API}/sites/${id}/vendors/${vendorIndex}/workers/${idx}/delete-bill`,
                                      { params: { path: billUrl } },
                                    );
                                    showUploadToast("Bill deleted ✅");
                                    const res = await axios.get(`${API}/sites/${id}`);
                                    const siteData = res.data;
                                    setVendor(siteData.vendors?.[Number(vendorIndex)] || null);
                                  } catch (err) {
                                    console.error(err);
                                    showUploadToast("Delete failed ❌");
                                  }
                                }}
                                className="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 py-0.5"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {worker.payments && worker.payments.length > 0 && (
                  <div className="mt-2 bg-white p-2 rounded border">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Payment History</p>
                    {worker.payments.map((payment, i) => (
                      <p key={i} className="text-xs text-gray-700">
                        ₹{payment.amount} • {new Date(payment.date).toLocaleDateString()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
}


