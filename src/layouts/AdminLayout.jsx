import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  return (
    // Changed bg-[#F8FAFC] to bg-[#0B1121] (Deep Dark)
    <div className="min-h-screen bg-[#0B1121] flex font-sans text-slate-200">
      <Sidebar />

      <main className="flex-1 w-full lg:pl-72 transition-all duration-300">
        <div className="p-6 mt-12 lg:mt-0 lg:p-10 max-w-480 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
