import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const adminEmail = localStorage.getItem("adminEmail") || "admin@ddtours.com";

  // Auto-close sidebar on route change (Mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminEmail");
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Trips Management", path: "/admin/trips", icon: Map },
    { name: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
    { name: "User Base", path: "/admin/users", icon: Users },
    { name: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  const sidebarVariants = {
    desktop: { x: 0, width: "18rem" }, // 18rem = w-72
    mobileClosed: { x: "-100%" },
    mobileOpen: { x: 0, width: "18rem" },
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink to={item.path} className="relative block mb-2 group">
        {isActive && (
          <motion.div
            layoutId="active-nav-bg"
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        <div
          className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
        >
          <item.icon
            size={20}
            className={
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-blue-400"
            }
          />
          <span className="font-medium text-sm tracking-wide">{item.name}</span>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto"
            >
              <ChevronRight size={16} className="text-blue-200" />
            </motion.div>
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* --- MOBILE TRIGGER BUTTON --- */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 active:scale-95 transition-transform"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- MOBILE BACKDROP --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={
          window.innerWidth >= 1024
            ? "desktop"
            : isMobileOpen
              ? "mobileOpen"
              : "mobileClosed"
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-[100] shadow-2xl font-sans"
      >
        {/* BRAND */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                DD
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  DD TOURS
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="h-px w-full bg-slate-800" />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-200 truncate">
                  Admin
                </span>
                <span className="text-xs text-slate-500 truncate">Online</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
