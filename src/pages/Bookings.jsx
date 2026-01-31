import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api"; // Ensure you have your Axios instance here
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/all");
      // Backend returns an array directly: res.data
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE STATUS UPDATE ---
  const handleStatusChange = async (id, newStatus) => {
    // Optimistic Update (Update UI immediately)
    const oldBookings = [...bookings];
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );

    try {
      await api.put(`/bookings/status/${id}`, { status: newStatus });

      if (newStatus === "confirmed") toast.success("Booking Confirmed!");
      if (newStatus === "cancelled") toast.error("Booking Cancelled");
    } catch (error) {
      // Revert if failed
      setBookings(oldBookings);
      toast.error("Update failed. Please try again.");
      console.error(error);
    }
  };

  // --- 3. CALCULATIONS & FILTERING ---
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Safe access to nested userDetails
      const userName = booking.userDetails?.name || "Unknown";
      const tripTitle = booking.tripTitle || "Untitled Trip";
      const bookingId = booking.id || "";

      const matchesSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tripTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed") // Only count confirmed revenue
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    return {
      revenue: totalRevenue,
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
    };
  }, [bookings]);

  // --- HELPER COMPONENTS ---
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          styles[status] || styles.pending
        } capitalize`}
      >
        {icons[status] || icons.pending} {status}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[80vh] p-6">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#fff",
            border: "1px solid #334155",
          },
        }}
      />

      {/* --- DASHBOARD STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: "Confirmed Revenue",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "All Bookings",
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
            className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-lg flex items-center gap-4"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- CONTROLS SECTION --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bookings Management
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Track and manage customer reservations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          {/* Status Filter Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
            {["all", "pending", "confirmed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  statusFilter === tab
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative group w-full sm:w-64">
            <Search
              className="absolute left-4 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* --- BOOKINGS LIST --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredBookings.map((booking) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={booking.id}
                className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-lg hover:border-slate-600 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Top Row: ID & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Booking ID
                    </span>
                    <span className="font-mono text-white font-bold bg-slate-900 px-2 py-1 rounded text-sm border border-slate-700/50 w-fit">
                      {booking.id.slice(0, 8)}... {/* Shorten ID for display */}
                    </span>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Middle: Trip Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                    {booking.tripTitle || "Unknown Trip"}
                  </h3>
                  <div className="space-y-2">
                    {/* User Name & Guests */}
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <User size={16} className="text-slate-500" />
                      <span className="text-slate-300 font-medium">
                        {booking.userDetails?.name || "Guest User"}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>{booking.seats || booking.guests || 1} Seats</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Calendar size={16} className="text-slate-500" />
                      <span>
                        Date:{" "}
                        <span className="text-slate-300 font-medium">
                          {booking.tripDate || booking.date || "TBD"}
                        </span>
                      </span>
                    </div>

                    {/* Price & Method */}
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <CreditCard size={16} className="text-slate-500" />
                      <span>
                        Total:{" "}
                        <span className="text-emerald-400 font-bold text-base">
                          ₹{(booking.totalPrice || 0).toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300 ml-auto capitalize">
                        {booking.userDetails?.paymentMethod?.replace(
                          /_/g,
                          " ",
                        ) || "Pay Later"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "confirmed")
                        }
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle size={16} /> Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "cancelled")
                        }
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(booking.id, "cancelled")
                      }
                      className="flex-1 bg-slate-700 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle size={16} /> Cancel Booking
                    </button>
                  )}

                  {booking.status === "cancelled" && (
                    <div className="w-full text-center text-slate-500 text-sm py-2 font-medium italic">
                      Booking Cancelled
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Filter size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">
            No bookings match
          </h3>
          <p className="text-slate-500">
            Try changing filters or search terms.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Bookings;
