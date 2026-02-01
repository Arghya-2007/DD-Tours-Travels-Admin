import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api"; // Check your path
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

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/all");
      // Sort: Newest First
      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
      );
      setBookings(sorted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ACTIONS: UPDATE STATUS ---
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

  // --- 3. ACTIONS: DELETE ---
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
      setSelectedBooking(null); // Close modal if open
    } catch (error) {
      setBookings(oldBookings);
      toast.error("Deletion failed.");
    }
  };

  // --- 4. ACTIONS: EXPORT TO CSV ---
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

    const rows = bookings.map((b) => [
      b.id,
      b.userDetails?.name || "N/A",
      b.userDetails?.phone || "N/A",
      b.tripTitle,
      b.bookingDate,
      b.totalAmount || b.totalPrice,
      b.status,
      b.paymentId || "Cash/Pending",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bookings_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 5. FILTERS ---
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const userName = booking.userDetails?.name || "";
      const tripTitle = booking.tripTitle || "";
      const bookingId = booking.id || "";
      const lowerSearch = searchTerm.toLowerCase();

      const matchesSearch =
        userName.toLowerCase().includes(lowerSearch) ||
        bookingId.toLowerCase().includes(lowerSearch) ||
        tripTitle.toLowerCase().includes(lowerSearch);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      revenue: bookings
        .filter((b) => b.status === "confirmed")
        .reduce(
          (sum, b) => sum + (Number(b.totalAmount || b.totalPrice) || 0),
          0,
        ),
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

      {/* --- DASHBOARD STATS --- */}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
          </motion.div>
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
          <p className="text-slate-400 mt-2 font-medium">
            Manage customer reservations and payments.
          </p>
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
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all border ${
              statusFilter === tab
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
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
            {filteredBookings.map((booking) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={booking.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl group relative overflow-hidden"
              >
                {/* Status Stripe */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    booking.status === "confirmed"
                      ? "bg-emerald-500"
                      : booking.status === "cancelled"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`}
                />

                <div className="flex justify-between items-start mb-4 pl-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      ID: {booking.id.slice(0, 8)}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                      {booking.tripTitle}
                    </h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="space-y-3 mb-6 pl-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <User size={16} /> {booking.userDetails?.name}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Calendar size={16} />{" "}
                    {new Date(
                      booking.bookingDate || booking.date,
                    ).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CreditCard size={16} />
                    <span className="text-white font-bold">
                      ₹
                      {(
                        booking.totalAmount || booking.totalPrice
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pl-3">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-blue-400 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <Eye size={16} /> Details
                  </button>
                  {booking.status === "pending" && (
                    <button
                      onClick={() =>
                        handleStatusChange(booking.id, "confirmed")
                      }
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-lg border border-emerald-500/20"
                      title="Quick Confirm"
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

      {!loading && filteredBookings.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Filter size={48} className="mx-auto mb-4 opacity-50" />
          <p>No bookings found.</p>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
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

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Section 1: Trip Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase mb-1">
                      Expedition
                    </p>
                    <p className="text-white font-bold">
                      {selectedBooking.tripTitle}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase mb-1">
                      Date
                    </p>
                    <p className="text-white font-bold">
                      {new Date(
                        selectedBooking.bookingDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase mb-1">
                      Team Size
                    </p>
                    <p className="text-white font-bold">
                      {selectedBooking.seats || 1} People
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase mb-1">
                      Total Amount
                    </p>
                    <p className="text-emerald-400 font-bold text-xl">
                      ₹
                      {(
                        selectedBooking.totalAmount ||
                        selectedBooking.totalPrice
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Section 2: User Intel */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Explorer Data
                  </h3>
                  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Full Name</span>
                      <span className="text-white">
                        {selectedBooking.userDetails?.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Phone</span>
                      <div className="flex gap-3">
                        <span className="text-white">
                          {selectedBooking.userDetails?.phone}
                        </span>
                        <a
                          href={`tel:${selectedBooking.userDetails?.phone}`}
                          className="text-emerald-500 hover:text-emerald-400"
                        >
                          <Phone size={16} />
                        </a>
                        <a
                          href={`https://wa.me/91${selectedBooking.userDetails?.phone}`}
                          target="_blank"
                          className="text-green-500 hover:text-green-400"
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Email</span>
                      <span className="text-white">
                        {selectedBooking.userDetails?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Address</span>
                      <span className="text-white max-w-[200px] text-right">
                        {selectedBooking.userDetails?.address}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Identity (Aadhar)</span>
                      <span className="text-slate-300 font-mono">
                        {selectedBooking.userDetails?.aadhar || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Payment Intel */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-purple-500" />{" "}
                    Transaction Log
                  </h3>
                  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Method</span>
                      <span className="text-white uppercase font-bold">
                        {selectedBooking.paymentMethod ||
                          selectedBooking.userDetails?.paymentMethod ||
                          "Manual"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID</span>
                      <span className="text-blue-400 font-mono text-xs">
                        {selectedBooking.paymentId || "PENDING"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order ID</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {selectedBooking.orderId || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between gap-4">
                <button
                  onClick={() => handleDelete(selectedBooking.id)}
                  className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Trash2 size={18} /> Delete Record
                </button>

                <div className="flex gap-3">
                  {selectedBooking.status !== "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "confirmed")
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                    >
                      <CheckCircle size={18} /> Confirm Mission
                    </button>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "cancelled")
                      }
                      className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-900/20"
                    >
                      <XCircle size={18} /> Cancel Mission
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
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  const icons = {
    pending: <Clock size={12} />,
    confirmed: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending} uppercase tracking-wider`}
    >
      {icons[status] || icons.pending} {status}
    </span>
  );
};

export default Bookings;
