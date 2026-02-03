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
  FileText,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const adminEmail = localStorage.getItem("adminEmail") || "admin@ddtours.com";

  // 1. Dynamic Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Auto-close on route change
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
    { name: "Blog Posts", path: "/admin/blogs", icon: FileText },
    { name: "User Base", path: "/admin/users", icon: Users },
    { name: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  // Animation Variants
  const sidebarVariants = {
    desktop: { x: 0, width: "18rem", opacity: 1 },
    mobileClosed: { x: "-100%", opacity: 0 },
    mobileOpen: { x: 0, width: "18rem", opacity: 1 },
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink to={item.path} className="relative block mb-2 group">
        {isActive && (
          <motion.div
            layoutId="active-nav-bg"
            // 🎨 CHANGED: Blue -> Orange/Amber Gradient for DD Tours Brand
            className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/10 border-l-4 border-orange-500 rounded-r-xl shadow-[0_0_20px_rgba(234,88,12,0.1)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        <div
          className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
            isActive
              ? "text-orange-100" // Lighter text for contrast
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <item.icon
            size={20}
            className={`transition-colors duration-300 ${
              isActive
                ? "text-orange-500" // Active Icon Color
                : "text-slate-500 group-hover:text-orange-400"
            }`}
          />
          <span className="font-medium text-sm tracking-wide">{item.name}</span>

          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto"
            >
              <ChevronRight size={16} className="text-orange-500" />
            </motion.div>
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* --- MOBILE TRIGGER --- */}
      {!isDesktop && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-3 bg-black/80 backdrop-blur-md text-white rounded-xl border border-white/10 shadow-2xl active:scale-95 transition-transform"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* --- MOBILE BACKDROP --- */}
      <AnimatePresence>
        {isMobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <motion.aside
        variants={sidebarVariants}
        initial={isDesktop ? "desktop" : "mobileClosed"}
        animate={
          isDesktop ? "desktop" : isMobileOpen ? "mobileOpen" : "mobileClosed"
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // 🎨 CHANGED: Darker background (#0c0a09) to match layout
        className={`fixed left-0 top-0 h-screen bg-[#0c0a09]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col z-[100] shadow-2xl font-sans`}
      >
        {/* BRAND HEADER */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* Logo Box */}
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                DD
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  DD TOURS
                </h1>
                <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold">
                  Command Center
                </p>
              </div>
            </div>

            {/* Close Button (Mobile Only) */}
            {!isDesktop && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* USER PROFILE FOOTER */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-1 ring-white/10">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                  Admin
                </span>
                <span className="text-xs text-emerald-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  System Online
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Logout"
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
