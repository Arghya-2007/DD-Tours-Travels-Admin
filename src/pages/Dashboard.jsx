import React from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MoreHorizontal,
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

// --- DUMMY DATA ---
const REVENUE_DATA = [
  { name: "Jan", revenue: 4000, bookings: 24 },
  { name: "Feb", revenue: 3000, bookings: 18 },
  { name: "Mar", revenue: 5000, bookings: 35 },
  { name: "Apr", revenue: 2780, bookings: 15 },
  { name: "May", revenue: 1890, bookings: 12 },
  { name: "Jun", revenue: 2390, bookings: 20 },
  { name: "Jul", revenue: 3490, bookings: 28 },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    user: "Amit Sharma",
    action: "booked",
    target: "Darjeeling Escape",
    time: "2 min ago",
    amount: "₹15,000",
  },
  {
    id: 2,
    user: "Priya Das",
    action: "joined",
    target: "",
    time: "1 hour ago",
    amount: "",
  },
  {
    id: 3,
    user: "Rahul Roy",
    action: "cancelled",
    target: "Sikkim Silk Route",
    time: "3 hours ago",
    amount: "",
  },
  {
    id: 4,
    user: "Sneha G",
    action: "booked",
    target: "Sundarbans Tour",
    time: "5 hours ago",
    amount: "₹8,500",
  },
];

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-480 mx-auto min-h-screen">
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
            value="₹4,25,000"
            trend="+12.5%"
            isPositive={true}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Active Bookings"
            value="42"
            trend="+8.2%"
            isPositive={true}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value="892"
            trend="-1.4%"
            isPositive={false}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Pending Trips"
            value="15"
            trend="Needs Attention"
            isPositive={null}
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
                  Monthly earnings overview
                </p>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* FIXED: Added min-w-0 to container and minWidth to ResponsiveContainer */}
            <div className="h-75 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
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
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
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

            {/* FIXED: Added min-w-0 to container */}
            <div className="h-75 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA}>
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
              {RECENT_ACTIVITY.map((item) => (
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
                      <span className="font-bold text-white">{item.user}</span>{" "}
                      {item.action === "booked" && (
                        <span className="text-emerald-400">booked a trip</span>
                      )}
                      {item.action === "cancelled" && (
                        <span className="text-red-400">cancelled booking</span>
                      )}
                      {item.action === "joined" && (
                        <span className="text-blue-400">
                          created an account
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
              ))}
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
              {[
                {
                  name: "Darjeeling",
                  bookings: 142,
                  revenue: "₹2.1L",
                  color: "bg-blue-500",
                },
                {
                  name: "Sikkim",
                  bookings: 98,
                  revenue: "₹1.8L",
                  color: "bg-purple-500",
                },
                {
                  name: "Sundarbans",
                  bookings: 65,
                  revenue: "₹85k",
                  color: "bg-emerald-500",
                },
              ].map((dest, i) => (
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
                    <h4 className="font-bold text-white">{dest.name}</h4>
                    <p className="text-xs text-slate-400">
                      {dest.bookings} bookings this month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{dest.revenue}</p>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                      <TrendingUp size={12} /> +12%
                    </div>
                  </div>
                </div>
              ))}
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
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${colorMap[color].split(" ")[0].replace("/10", "")}`}
      />
    </motion.div>
  );
};

export default Dashboard;
