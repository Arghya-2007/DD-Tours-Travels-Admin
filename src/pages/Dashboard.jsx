import React, { useEffect, useState } from "react";
import api from "../services/api"; // Your Axios instance
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MoreHorizontal,
  Loader, // Added for loading state
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

  // --- DATA PROCESSING HELPERS ---
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

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel Fetch: Bookings and Users
        // Note: Assuming you have a /users endpoint. If not, we'll estimate from bookings.
        const [bookingsRes, usersRes] = await Promise.allSettled([
          api.get("/bookings/all"),
          api.get("/users"), // Or /api/users/all depending on your route
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
    // 1. CALCULATE TOP STATS
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);

    const activeCount = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending",
    ).length;

    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    setStats({
      revenue: totalRevenue,
      activeBookings: activeCount,
      totalUsers: users.length || bookings.length, // Fallback to booking count if user fetch fails
      pendingTrips: pendingCount,
    });

    // 2. PROCESS CHART DATA (Group by Month)
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

    // Create a map for the current year's months
    const chartMap = new Array(12).fill(0).map((_, i) => ({
      name: months[i],
      revenue: 0,
      bookings: 0,
    }));

    bookings.forEach((b) => {
      const date = new Date(b.createdAt || b.date); // Fallback to trip date if created missing
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        chartMap[monthIndex].bookings += 1;
        if (b.status === "confirmed") {
          chartMap[monthIndex].revenue += Number(b.totalPrice) || 0;
        }
      }
    });

    // Slice to current month + previous 6 months for cleaner view
    const currentMonth = new Date().getMonth();
    const startMonth = Math.max(0, currentMonth - 6);
    setChartData(chartMap.slice(startMonth, currentMonth + 1));

    // 3. RECENT ACTIVITY (Top 5 newest)
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const activityFeed = sortedBookings.slice(0, 5).map((b) => ({
      id: b.id,
      user: b.userDetails?.name || "Guest User",
      action: b.status === "cancelled" ? "cancelled" : "booked",
      target: b.tripTitle || "Trip",
      time: getTimeAgo(b.createdAt),
      amount: formatCurrency(b.totalPrice),
    }));
    setRecentActivity(activityFeed);

    // 4. POPULAR DESTINATIONS
    const destCounts = {};
    bookings.forEach((b) => {
      // Clean title string to group similar trips
      const title = b.tripTitle || "Unknown Trip";
      if (!destCounts[title]) {
        destCounts[title] = { name: title, bookings: 0, revenue: 0 };
      }
      destCounts[title].bookings += 1;
      if (b.status === "confirmed") {
        destCounts[title].revenue += Number(b.totalPrice) || 0;
      }
    });

    // Convert to array, sort by bookings, take top 3
    const topDestinations = Object.values(destCounts)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3)
      .map((d, i) => ({
        ...d,
        revenue: formatCurrency(d.revenue),
        color:
          i === 0
            ? "bg-blue-500"
            : i === 1
              ? "bg-purple-500"
              : "bg-emerald-500",
      }));

    setPopularDestinations(topDestinations);
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4">
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-2 font-medium">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* --- 1. STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue)}
            trend="YTD" // Year to Date
            isPositive={true}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            trend="Active"
            isPositive={true}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            trend="Total"
            isPositive={true} // Defaulting to positive
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Pending Trips"
            value={stats.pendingTrips}
            trend={stats.pendingTrips > 0 ? "Action Needed" : "All Clear"}
            isPositive={stats.pendingTrips === 0}
            icon={Activity}
            color="amber"
          />
        </div>

        {/* --- 2. CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart (Revenue) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Revenue Analytics
                </h3>
                <p className="text-sm text-slate-400">
                  Monthly earnings overview ({new Date().getFullYear()})
                </p>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="h-75 w-full min-w-0">
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
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Secondary Chart (Bookings Bar) */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col"
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Booking Volume
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Trips booked per month
            </p>

            <div className="h-75 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "#334155", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* --- 3. RECENT ACTIVITY & POPULAR TRIPS --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activity Feed */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <button className="text-blue-400 text-sm font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No recent activity found.
                </p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        item.action === "booked"
                          ? "bg-emerald-500"
                          : item.action === "cancelled"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    />

                    <div className="flex-1">
                      <p className="text-sm text-slate-300">
                        <span className="font-bold text-white">
                          {item.user}
                        </span>{" "}
                        {item.action === "booked" && (
                          <span className="text-emerald-400">
                            booked a trip
                          </span>
                        )}
                        {item.action === "cancelled" && (
                          <span className="text-red-400">
                            cancelled booking
                          </span>
                        )}
                      </p>
                      {item.target && (
                        <p className="text-xs font-bold text-slate-500 mt-1">
                          {item.target}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">{item.time}</p>
                      {item.amount && (
                        <p className="text-sm font-bold text-white mt-1">
                          {item.amount}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Popular Destinations */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Trending Destinations
            </h3>
            <div className="space-y-4">
              {popularDestinations.length === 0 ? (
                <p className="text-slate-500 text-sm">No trending data yet.</p>
              ) : (
                popularDestinations.map((dest, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${dest.color} bg-opacity-20 flex items-center justify-center text-white font-bold`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white truncate max-w-37.5">
                        {dest.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {dest.bookings} bookings total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{dest.revenue}</p>
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <TrendingUp size={12} /> Top {i + 1}
                      </div>
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

const StatCard = ({ title, value, trend, isPositive, icon: Icon, color }) => {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {isPositive !== null && (
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-3xl font-extrabold text-white mb-1">{value}</h3>
      <p className="text-slate-400 font-medium text-sm">{title}</p>

      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${colorMap[
          color
        ]
          .split(" ")[0]
          .replace("/10", "")}`}
      />
    </motion.div>
  );
};

export default Dashboard;
