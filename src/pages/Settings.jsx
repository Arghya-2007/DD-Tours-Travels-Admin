import React, { useState } from "react";
import {
  Save,
  User,
  Lock,
  Globe,
  Bell,
  Smartphone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Shield,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // --- DUMMY STATE (Simulating Database Data) ---
  const [formData, setFormData] = useState({
    siteName: "DD Tour & Travel",
    supportEmail: "support@ddtours.com",
    supportPhone: "+91 98765 43210",
    address: "Salt Lake, Sector V, Kolkata, WB",
    facebook: "https://facebook.com/ddtours",
    instagram: "https://instagram.com/ddtours",
    adminName: "Arghya Pal",
    adminEmail: "admin@ddtours.com",
    maintenanceMode: false,
    emailNotifications: true,
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    toast.success("System parameters updated successfully!");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full relative min-h-screen">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1c1917",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <SettingsIcon size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              System Configuration
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-lg text-sm ml-1">
            Manage global parameters, access controls, and integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/40 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={20} strokeWidth={2.5} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- SIDEBAR NAVIGATION --- */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "general", label: "General Info", icon: Globe },
            { id: "account", label: "Admin Account", icon: User },
            { id: "social", label: "Social Links", icon: Facebook },
            { id: "system", label: "System Control", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. GENERAL INFO SECTION */}
          {activeTab === "general" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                <Globe className="text-orange-500" /> Business Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Website Name"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  icon={Globe}
                />
                <InputGroup
                  label="Support Phone"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleChange}
                  icon={Smartphone}
                />
                <InputGroup
                  label="Support Email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  icon={Mail}
                />
                <div className="md:col-span-2">
                  <InputGroup
                    label="Office Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    icon={MapPin}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ADMIN ACCOUNT SECTION */}
          {activeTab === "account" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                <User className="text-purple-500" /> Admin Profile
              </h2>

              <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full bg-[#252220] flex items-center justify-center text-3xl font-bold text-slate-500 border-2 border-dashed border-slate-700">
                  AP
                </div>
                <div>
                  <button className="text-orange-500 font-bold text-sm hover:text-orange-400 transition-colors">
                    Upload New Avatar
                  </button>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">
                    JPG or PNG. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Admin Name"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  icon={User}
                />
                <InputGroup
                  label="Admin Email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  icon={Mail}
                  disabled
                />
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Lock size={18} className="text-slate-400" /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                  />
                  <InputGroup
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SOCIAL MEDIA SECTION */}
          {activeTab === "social" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                <Facebook className="text-blue-500" /> Social Integrations
              </h2>
              <div className="space-y-6">
                <InputGroup
                  label="Facebook URL"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  icon={Facebook}
                />
                <InputGroup
                  label="Instagram URL"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  icon={Instagram}
                />
                <InputGroup
                  label="Twitter / X URL"
                  placeholder="https://x.com/..."
                  icon={Twitter}
                />
              </div>
            </motion.div>
          )}

          {/* 4. SYSTEM CONTROL SECTION */}
          {activeTab === "system" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="bg-[#1c1917] rounded-[2rem] p-8 border border-white/5 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                  <Shield className="text-emerald-500" /> System Preferences
                </h2>

                {/* Maintenance Toggle */}
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 mb-4">
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Maintenance Mode
                      {formData.maintenanceMode && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                          ACTIVE
                        </span>
                      )}
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Temporarily disable the user-facing website for updates.
                    </p>
                  </div>
                  <Toggle
                    checked={formData.maintenanceMode}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "maintenanceMode",
                          type: "checkbox",
                          checked: e.target.checked,
                        },
                      })
                    }
                  />
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-white font-bold">
                      Email Notifications
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Receive automated emails for new bookings.
                    </p>
                  </div>
                  <Toggle
                    checked={formData.emailNotifications}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "emailNotifications",
                          type: "checkbox",
                          checked: e.target.checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 rounded-[2rem] p-8 border border-red-500/10">
                <h2 className="text-xl font-bold text-red-400 mb-2">
                  Danger Zone
                </h2>
                <p className="text-red-300/60 text-sm mb-6">
                  Irreversible actions. Use with extreme caution.
                </p>

                <div className="flex gap-4">
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                    <LogOut size={16} /> Force Sign-out All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-orange-500 transition-colors"
        />
      )}
      <input
        type={type}
        className={`w-full bg-[#0c0a09] border border-white/10 rounded-xl py-3 pr-4 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 outline-none text-white font-medium transition-all placeholder-slate-700 ${Icon ? "pl-11" : "pl-4"} ${props.disabled ? "opacity-50 cursor-not-allowed bg-black/40" : ""}`}
        {...props}
      />
    </div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600 transition-colors"></div>
  </label>
);

export default Settings;
