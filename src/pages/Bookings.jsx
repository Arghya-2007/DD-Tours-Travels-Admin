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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- 1. DATA NORMALIZER (CRITICAL FIX) ---
  // This converts different DB models into one standard format for the UI
  const normalizeBooking = (b) => {
    const details = b.userDetails || {};

    return {
      id: b.id || b._id, // Handle MongoDB _id or id
      originalData: b, // Keep raw data for updates

      // Standardized Fields
      customerName: details.name || details.fullName || "Unknown User",
      phone: details.phone || "N/A",
      email: details.email || "N/A",
      address: details.address || "N/A",
      aadhar: details.aadhar || details.aadharNo || "N/A", // Handles both formats

      tripTitle: b.tripTitle || "Unknown Trip",
      date: b.bookingDate || b.tripDate || b.createdAt, // Prioritize Booking Date
      seats: b.seats || 1,

      // Price Logic
      amount: b.totalAmount || b.totalPrice || b.amountPaid || 0,

      // Status & Payment
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
      // Sort by newest first using createdAt or date
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
    const oldBookings = [...bookings];
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );

    try {
      await api.put(`/bookings/status/${id}`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      if (selectedBooking)
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      setBookings(oldBookings);
      toast.error("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this record?",
      )
    )
      return;
    const oldBookings = [...bookings];
    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Record permanently erased.");
      setSelectedBooking(null);
    } catch (error) {
      setBookings(oldBookings);
      toast.error("Deletion failed.");
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
    link.setAttribute("download", `dd_tours_export.csv`);
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
    <div className="w-full max-w-7xl mx-auto min-h-screen p-6 bg-slate-950 text-slate-200">
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: "#1E293B", color: "#fff" } }}
      />

      {/* --- STATS --- */}
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
            icon: Calendar,
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
            label: "Confirmed Trips",
            value: stats.confirmed,
            icon: CheckCircle,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg flex items-center gap-4"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Mission Control{" "}
            <span className="text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
              {bookings.length}
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <div className="relative group w-full sm:w-64">
            <Search
              className="absolute left-4 top-3 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "pending", "confirmed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all border ${
              statusFilter === tab
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- GRID --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBookings.map((b) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={b.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    b.status === "confirmed"
                      ? "bg-emerald-500"
                      : b.status === "cancelled"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`}
                />

                <div className="flex justify-between items-start mb-4 pl-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      ID: {b.id.slice(0, 8)}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                      {b.tripTitle}
                    </h3>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="space-y-3 mb-6 pl-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <User size={16} /> {b.customerName}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Calendar size={16} />{" "}
                    {new Date(b.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CreditCard size={16} />
                    <span className="text-white font-bold">
                      ₹{Number(b.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pl-3">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-blue-400 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Eye size={16} /> Details
                  </button>
                  {b.status === "pending" && (
                    <button
                      onClick={() => handleStatusChange(b.id, "confirmed")}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-lg border border-emerald-500/20"
                    >
                      <CheckCircle size={18} />
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
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Mission Details
                  </h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">
                    ID: {selectedBooking.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Trip Info */}
                <div className="grid grid-cols-2 gap-6">
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
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Explorer Data
                  </h3>
                  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
                    <Row
                      label="Full Name"
                      value={selectedBooking.customerName}
                    />
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Phone</span>
                      <div className="flex gap-3">
                        <span className="text-white">
                          {selectedBooking.phone}
                        </span>
                        <a
                          href={`tel:${selectedBooking.phone}`}
                          className="text-emerald-500"
                        >
                          <Phone size={16} />
                        </a>
                        <a
                          href={`https://wa.me/91${selectedBooking.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-500"
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </div>
                    <Row label="Email" value={selectedBooking.email} />
                    <Row label="Address" value={selectedBooking.address} />
                    <Row
                      label="Identity (Aadhar)"
                      value={selectedBooking.aadhar}
                    />
                  </div>
                </div>

                {/* Payment Intel */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-purple-500" />{" "}
                    Transaction Log
                  </h3>
                  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
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

              <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between gap-4">
                <button
                  onClick={() => handleDelete(selectedBooking.id)}
                  className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Trash2 size={18} /> Delete
                </button>
                <div className="flex gap-3">
                  {selectedBooking.status !== "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "confirmed")
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
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
  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
    <p className="text-slate-500 text-xs uppercase mb-1">{label}</p>
    <p
      className={`font-bold ${isHighlight ? "text-emerald-400 text-xl" : "text-white"}`}
    >
      {value}
    </p>
  </div>
);

const Row = ({ label, value, isCaps, isMono, color }) => (
  <div className="flex justify-between border-b border-slate-700 pb-2 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span
      className={`text-white text-right ${isCaps ? "uppercase font-bold" : ""} ${isMono ? "font-mono text-xs" : ""} ${color || ""}`}
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
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending} uppercase tracking-wider`}
    >
      {status}
    </span>
  );
};

export default Bookings;
