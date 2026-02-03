import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import {
  Search,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  TrendingUp,
  AlertCircle,
  Loader,
  Eye,
  Trash2,
  Download,
  Phone,
  MapPin,
  Shield,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- 1. DATA NORMALIZER ---
  const normalizeBooking = (b) => {
    const details = b.userDetails || {};

    return {
      id: b.id || b._id,
      originalData: b,

      // Standardized Fields
      customerName: details.name || details.fullName || "Unknown User",
      phone: details.phone || "N/A",
      email: details.email || "N/A",
      address: details.address || "N/A",
      aadhar: details.aadhar || details.aadharNo || "N/A",

      tripTitle: b.tripTitle || "Unknown Trip",
      date: b.bookingDate || b.tripDate || b.createdAt,
      seats: b.seats || 1,

      amount: b.totalAmount || b.totalPrice || b.amountPaid || 0,

      status: b.status || "pending",
      paymentMethod:
        b.paymentMethod === "online"
          ? "Online (Razorpay)"
          : details.paymentMethod || "Pay on Arrival",
      paymentId: b.paymentId || "Pending / Cash",
      orderId: b.orderId || "-",
      gateway: b.gateway || "Manual",
    };
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/all");
      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.createdAt || b.bookingDate || b.tripDate) -
          new Date(a.createdAt || a.bookingDate || a.tripDate),
      );
      setBookings(sorted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const loadingToast = toast.loading("Updating status...");
    const oldBookings = [...bookings];

    // Optimistic Update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );

    try {
      await api.put(`/bookings/status/${id}`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`, { id: loadingToast });
      if (selectedBooking)
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      setBookings(oldBookings);
      toast.error("Update failed.", { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ WARNING: Permanently delete this record?")) return;

    const loadingToast = toast.loading("Erasing record...");
    const oldBookings = [...bookings];

    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Record permanently erased.", { id: loadingToast });
      setSelectedBooking(null);
    } catch (error) {
      setBookings(oldBookings);
      toast.error("Deletion failed.", { id: loadingToast });
    }
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Customer",
      "Phone",
      "Trip",
      "Date",
      "Amount",
      "Status",
      "Payment ID",
    ];
    const rows = bookings.map((raw) => {
      const b = normalizeBooking(raw);
      return [
        b.id,
        b.customerName,
        b.phone,
        b.tripTitle,
        new Date(b.date).toLocaleDateString(),
        b.amount,
        b.status,
        b.paymentId,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `dd_tours_manifest_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
  };

  const filteredBookings = useMemo(() => {
    return bookings.map(normalizeBooking).filter((b) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        b.customerName.toLowerCase().includes(lowerSearch) ||
        b.id.toLowerCase().includes(lowerSearch) ||
        b.tripTitle.toLowerCase().includes(lowerSearch);

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const normalized = bookings.map(normalizeBooking);
    return {
      revenue: normalized
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
    };
  }, [bookings]);

  return (
    <div className="w-full relative min-h-screen">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1c1917",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />

      {/* --- STATS DASHBOARD --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: "Revenue (Confirmed)",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Bookings",
            value: stats.total,
            icon: LayoutGrid,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Pending Actions",
            value: stats.pending,
            icon: AlertCircle,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Confirmed Seats",
            value: stats.confirmed,
            icon: CheckCircle,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#1c1917] rounded-[2rem] p-6 border border-white/5 shadow-xl flex items-center gap-4 hover:border-white/10 transition-colors"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-lg`}
            >
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Mission Manifest{" "}
            <span className="text-sm bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">
              {bookings.length}
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#1c1917] hover:bg-[#252220] text-slate-200 px-5 py-3 rounded-xl text-sm font-bold border border-white/10 transition-colors shadow-lg"
          >
            <Download size={16} /> Export CSV
          </button>
          <div className="relative group w-full sm:w-72">
            <Search
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, trip ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#1c1917] border border-white/10 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "pending", "confirmed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all border ${
              statusFilter === tab
                ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20"
                : "bg-[#1c1917] border-white/5 text-slate-400 hover:bg-[#252220] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- GRID --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-orange-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          <AnimatePresence>
            {filteredBookings.map((b) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={b.id}
                className="bg-[#1c1917] rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-all"
              >
                {/* Status Strip */}
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    b.status === "confirmed"
                      ? "bg-emerald-500"
                      : b.status === "cancelled"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`}
                />

                <div className="flex justify-between items-start mb-4 pl-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      ID: {b.id.slice(0, 8)}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px] mt-1 group-hover:text-orange-400 transition-colors">
                      {b.tripTitle}
                    </h3>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="space-y-3 mb-6 pl-4 border-l border-white/5 ml-1">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <User size={16} className="text-slate-500" />{" "}
                    <span className="text-slate-300 font-medium">
                      {b.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Calendar size={16} className="text-slate-500" />{" "}
                    {new Date(b.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CreditCard size={16} className="text-slate-500" />
                    <span className="text-white font-bold">
                      ₹{Number(b.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pl-4">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex-1 bg-[#252220] hover:bg-[#302c2a] text-slate-300 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-white/5 transition-all"
                  >
                    <Eye size={16} /> Details
                  </button>
                  {b.status === "pending" && (
                    <button
                      onClick={() => handleStatusChange(b.id, "confirmed")}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20 transition-all"
                      title="Quick Confirm"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- DETAILED MODAL --- */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0c0a09] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0c0a09] z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield size={20} className="text-orange-500" /> Mission
                    Intel
                  </h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                    ID: {selectedBooking.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-[#0c0a09]">
                {/* Trip Info */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox
                    label="Expedition"
                    value={selectedBooking.tripTitle}
                  />
                  <InfoBox
                    label="Date"
                    value={new Date(selectedBooking.date).toLocaleDateString()}
                  />
                  <InfoBox
                    label="Team Size"
                    value={`${selectedBooking.seats} People`}
                  />
                  <InfoBox
                    label="Total Amount"
                    value={`₹${Number(selectedBooking.amount).toLocaleString()}`}
                    isHighlight
                  />
                </div>

                {/* User Intel */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                    Explorer Profile
                  </h3>
                  <div className="bg-[#1c1917] rounded-2xl p-6 border border-white/5 space-y-4">
                    <Row
                      label="Full Name"
                      value={selectedBooking.customerName}
                    />
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400 text-sm">Phone</span>
                      <div className="flex gap-3 items-center">
                        <span className="text-white font-mono text-sm">
                          {selectedBooking.phone}
                        </span>
                        <a
                          href={`tel:${selectedBooking.phone}`}
                          className="text-slate-400 hover:text-white"
                        >
                          <Phone size={14} />
                        </a>
                        <a
                          href={`https://wa.me/91${selectedBooking.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-500 hover:text-green-400"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                    <Row label="Email" value={selectedBooking.email} />
                    <Row label="Address" value={selectedBooking.address} />
                    <Row
                      label="Identity (Aadhar)"
                      value={selectedBooking.aadhar}
                      isMono
                    />
                  </div>
                </div>

                {/* Payment Intel */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                    Transaction Log
                  </h3>
                  <div className="bg-[#1c1917] rounded-2xl p-6 border border-white/5 space-y-4">
                    <Row
                      label="Method"
                      value={selectedBooking.paymentMethod}
                      isCaps
                    />
                    <Row
                      label="Transaction ID"
                      value={selectedBooking.paymentId}
                      isMono
                      color="text-blue-400"
                    />
                    <Row
                      label="Order ID"
                      value={selectedBooking.orderId}
                      isMono
                    />
                    <Row
                      label="Gateway"
                      value={selectedBooking.gateway}
                      isCaps
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#0c0a09] flex justify-between gap-4 z-10">
                <button
                  onClick={() => handleDelete(selectedBooking.id)}
                  className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-5 py-3 rounded-xl font-bold transition-colors text-sm uppercase tracking-wider"
                >
                  <Trash2 size={18} /> Delete Record
                </button>
                <div className="flex gap-3">
                  {selectedBooking.status !== "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "confirmed")
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/20"
                    >
                      <CheckCircle size={18} /> Confirm
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB COMPONENTS ---
const InfoBox = ({ label, value, isHighlight }) => (
  <div className="bg-[#1c1917] p-4 rounded-xl border border-white/5">
    <p className="text-slate-500 text-[10px] uppercase mb-1 font-bold tracking-wider">
      {label}
    </p>
    <p
      className={`font-bold ${isHighlight ? "text-emerald-400 text-xl" : "text-white text-sm"}`}
    >
      {value}
    </p>
  </div>
);

const Row = ({ label, value, isCaps, isMono, color }) => (
  <div className="flex justify-between border-b border-white/5 pb-2 last:border-0 items-center">
    <span className="text-slate-400 text-sm">{label}</span>
    <span
      className={`text-white text-right ${isCaps ? "uppercase font-bold text-xs" : "text-sm"} ${isMono ? "font-mono text-xs tracking-wider" : ""} ${color || ""}`}
    >
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${styles[status] || styles.pending} uppercase tracking-wider`}
    >
      {status}
    </span>
  );
};

export default Bookings;
