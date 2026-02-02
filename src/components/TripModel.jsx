import React, { useState, useEffect } from "react";
import { X, Plus, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TripModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    duration: "",
    description: "",
    imageUrl: "",
    // NEW FIELDS
    fixedDate: "", // Date String "2026-05-20"
    expectedMonth: "", // String "May 2026"
    bookingEndsIn: "", // String "2 Days before"
    placesCovered: [], // Array ["Paris", "Lyon"]
  });

  const [placeInput, setPlaceInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        placesCovered: initialData.placesCovered || [],
        fixedDate: initialData.fixedDate || "",
        expectedMonth: initialData.expectedMonth || "",
      });
    } else {
      setFormData({
        title: "",
        location: "",
        price: "",
        duration: "",
        description: "",
        imageUrl: "",
        fixedDate: "",
        expectedMonth: "",
        bookingEndsIn: "",
        placesCovered: [],
      });
    }
  }, [initialData, isOpen]);

  // Handle "Places Covered" Tags
  const handleAddPlace = (e) => {
    if (e.key === "Enter" && placeInput.trim()) {
      e.preventDefault();
      if (!formData.placesCovered.includes(placeInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          placesCovered: [...prev.placesCovered, placeInput.trim()],
        }));
      }
      setPlaceInput("");
    }
  };

  const removePlace = (placeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      placesCovered: prev.placesCovered.filter((p) => p !== placeToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
            <h2 className="text-2xl font-bold text-white">
              {initialData ? "Edit Mission" : "New Expedition"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <form id="tripForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mission Title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Himalayan Trek"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Manali, India"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Price (INR)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 3 Days / 2 Nights"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Booking Ends
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 days before"
                    value={formData.bookingEndsIn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bookingEndsIn: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* NEW FIELDS: Dates */}
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Fixed Launch Date
                  </label>
                  <input
                    type="date"
                    value={formData.fixedDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fixedDate: e.target.value,
                        expectedMonth: "",
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Select only if date is confirmed.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    OR Expected Month
                  </label>
                  <select
                    disabled={!!formData.fixedDate}
                    value={formData.expectedMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedMonth: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white disabled:opacity-50 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Places Covered (Tag Input) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Places Covered
                </label>
                <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 min-h-[50px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500">
                  {formData.placesCovered.map((place, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-500/20 text-blue-300 text-sm px-2 py-1 rounded-md flex items-center gap-1 border border-blue-500/30"
                    >
                      {place}
                      <button
                        type="button"
                        onClick={() => removePlace(place)}
                        className="hover:text-white"
                      >
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={
                      formData.placesCovered.length === 0
                        ? "Type place & hit Enter..."
                        : ""
                    }
                    value={placeInput}
                    onChange={(e) => setPlaceInput(e.target.value)}
                    onKeyDown={handleAddPlace}
                    className="bg-transparent border-none outline-none text-white flex-1 min-w-[120px]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              form="tripForm"
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              {initialData ? "Save Changes" : "Create Expedition"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripModal;
