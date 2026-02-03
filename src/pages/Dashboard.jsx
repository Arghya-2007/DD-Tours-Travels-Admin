import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MoreHorizontal,
  Loader,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    activeBookings: 0,
    totalUsers: 0,
    pendingTrips: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);

  // --- HELPERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // --- DATA FETCHING & PROCESSING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, usersRes] = await Promise.allSettled([
          api.get("/bookings/all"),
          api.get("/users"), // Adjust if your endpoint is different
        ]);

        const bookings =
          bookingsRes.status === "fulfilled" ? bookingsRes.value.data : [];
        const users =
          usersRes.status === "fulfilled" ? usersRes.value.data : [];

        processDashboardData(bookings, users);
      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processDashboardData = (bookings, users) => {
    // 1. STATS
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce(
        (acc, curr) => acc + (Number(curr.totalPrice || curr.totalAmount) || 0),
        0,
      );

    const activeCount = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending",
    ).length;

    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    setStats({
      revenue: totalRevenue,
      activeBookings: activeCount,
      totalUsers: users.length || 0, // Fallback handled in UI
      pendingTrips: pendingCount,
    });

    // 2. CHART DATA (Revenue Curve)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();
    const chartMap = new Array(12).fill(0).map((_, i) => ({
      name: months[i],
      revenue: 0,
      bookings: 0,
    }));

    bookings.forEach((b) => {
      const date = new Date(b.createdAt || b.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        chartMap[monthIndex].bookings += 1;
        if (b.status === "confirmed") {
          chartMap[monthIndex].revenue +=
            Number(b.totalPrice || b.totalAmount) || 0;
        }
      }
    });

    // Show last 6 months + current
    const currentMonth = new Date().getMonth();
    const startMonth = Math.max(0, currentMonth - 6);
    setChartData(chartMap.slice(startMonth, currentMonth + 1));

    // 3. RECENT ACTIVITY
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const activityFeed = sortedBookings.slice(0, 5).map((b) => ({
      id: b.id || b._id,
      user: b.userDetails?.name || "Guest User",
      action: b.status,
      target: b.tripTitle || "Unknown Expedition",
      time: getTimeAgo(b.createdAt),
      amount: formatCurrency(b.totalPrice || b.totalAmount),
    }));
    setRecentActivity(activityFeed);

    // 4. POPULAR DESTINATIONS
    const destCounts = {};
    bookings.forEach((b) => {
      const title = b.tripTitle || "Unknown Trip";
      if (!destCounts[title]) {
        destCounts[title] = { name: title, bookings: 0, revenue: 0 };
      }
      destCounts[title].bookings += 1;
      if (b.status === "confirmed") {
        destCounts[title].revenue += Number(b.totalPrice || b.totalAmount) || 0;
      }
    });

    const topDestinations = Object.values(destCounts)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3)
      .map((d, i) => ({
        ...d,
        revenueFormatted: formatCurrency(d.revenue),
        rank: i + 1,
      }));

    setPopularDestinations(topDestinations);
  };

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c0a09]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-orange-500" size={48} />
          <p className="text-slate-500 text-sm animate-pulse tracking-widest uppercase">
            Initializing Command Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Command Center
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            System Status:{" "}
            <span className="text-emerald-400 font-bold">OPERATIONAL</span>
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500 font-mono">
            {new Date().toDateString()}
          </p>
          <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mt-1">
            Admin Mode
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* --- 1. STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue)}
            trend="+12% vs last mo"
            isPositive={true}
            icon={DollarSign}
            color="emerald" // Green for money
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            trend="Live Operations"
            isPositive={true}
            icon={Calendar}
            color="orange" // Brand color for primary metric
          />
          <StatCard
            title="Total Operatives"
            value={stats.totalUsers || "--"}
            trend="Growing"
            isPositive={true}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Pending Actions"
            value={stats.pendingTrips}
            trend={stats.pendingTrips > 0 ? "Requires Attention" : "All Clear"}
            isPositive={stats.pendingTrips === 0}
            icon={stats.pendingTrips > 0 ? ShieldAlert : Activity}
            color={stats.pendingTrips > 0 ? "red" : "gray"}
          />
        </div>

        {/* --- 2. MAIN CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-500" /> Revenue
                  Trajectory
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                  Financial Performance ({new Date().getFullYear()})
                </p>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="h-80 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#64748b"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0c0a09",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fb923c" }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ea580c"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Booking Volume Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Booking Volume
            </h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-8">
              Trips Confirmed
            </p>

            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    fontSize={10}
                  />
                  <Tooltip
                    cursor={{ fill: "#333", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "#0c0a09",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="bookings" radius={[4, 4, 0, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#10b981" : "#059669"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* --- 3. BOTTOM SECTION --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
          {/* Recent Intel Feed */}
          <motion.div
            variants={itemVariants}
            className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-blue-500" /> Recent Intel
              </h3>
              <button className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">
                View Log
              </button>
            </div>

            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No recent activity detected.
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${
                        item.action === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : item.action === "cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.action === "confirmed" ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <Activity size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        <span className="font-bold text-white">
                          {item.user}
                        </span>
                        <span className="text-slate-500"> • {item.action}</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {item.target}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500 mb-1">{item.time}</p>
                      <p className="text-sm font-bold text-white">
                        {item.amount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Top Targets */}
          <motion.div
            variants={itemVariants}
            className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <MapPin size={18} className="text-purple-500" /> High Value
              Targets
            </h3>

            <div className="space-y-4">
              {popularDestinations.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No data available.
                </div>
              ) : (
                popularDestinations.map((dest, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="text-2xl font-bold text-slate-600 w-6">
                      0{dest.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">
                        {dest.name}
                      </h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">
                        {dest.bookings} Bookings Confirmed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold font-mono">
                        {dest.revenueFormatted}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ title, value, trend, isPositive, icon: Icon, color }) => {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    red: "text-red-400 bg-red-500/10",
    gray: "text-slate-400 bg-slate-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[#1c1917] p-6 rounded-[2rem] border border-white/5 shadow-lg relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${colors[color] || colors.gray}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${isPositive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
        >
          {isPositive ? (
            <ArrowUpRight size={10} />
          ) : (
            <ArrowDownRight size={10} />
          )}
          {trend}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-extrabold text-white mb-1">{value}</h3>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {/* Decorative Glow */}
      <div
        className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colors[color]?.split(" ")[0].replace("text-", "bg-")}`}
      />
    </motion.div>
  );
};

export default Dashboard;
