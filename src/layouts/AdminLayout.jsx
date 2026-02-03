import React, { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const AdminLayout = () => {
  const contentRef = useRef(null);
  const location = useLocation(); // Hook to detect page changes

  // --- PAGE TRANSITION ANIMATION ---
  // Whenever the route changes (location.pathname), we gently fade the content in.
  useGSAP(
    () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    },
    { dependencies: [location.pathname], scope: contentRef },
  );

  return (
    <div className="min-h-screen bg-[#0c0a09] flex font-sans text-slate-200 relative overflow-x-hidden">
      {/* --- BACKGROUND EFFECTS (Tactical Command Theme) --- */}

      {/* 1. Primary Glow (Top-Left) - Orange Tint for DD Tours */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Secondary Glow (Bottom-Right) - Deep Stone/Blue */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-[100px] pointer-events-none" />

      {/* 3. Tactical Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* --- SIDEBAR (Fixed Command Column) --- */}
      <Sidebar />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full lg:pl-[18rem] transition-all duration-300 relative z-10">
        <div
          ref={contentRef}
          className="p-6 mt-14 lg:mt-0 lg:p-10 max-w-7xl mx-auto min-h-screen"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
