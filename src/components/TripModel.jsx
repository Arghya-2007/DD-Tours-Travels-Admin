import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Loader2,
  Plus,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TripModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    duration: "",
    location: "",
    description: "",
    // NEW FIELDS
    fixedDate: "",
    expectedMonth: "",
    bookingEndsIn: "",
  });

  // Tag States
  const [includedItems, setIncludedItems] = useState([]);
  const [newItemInput, setNewItemInput] = useState("");

  const [placesCovered, setPlacesCovered] = useState([]);
  const [newPlaceInput, setNewPlaceInput] = useState("");

  // Image States
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        price: initialData.price || "",
        duration: initialData.duration || "",
        location: initialData.location || "",
        description: initialData.description || "",
        fixedDate: initialData.fixedDate || "",
        expectedMonth: initialData.expectedMonth || "",
        bookingEndsIn: initialData.bookingEndsIn || "",
      });
      setIncludedItems(initialData.includedItems || []);
      setPlacesCovered(initialData.placesCovered || []);

      if (initialData.images && initialData.images.length > 0) {
        setPreviews(initialData.images.map((img) => img.url));
      } else if (initialData.imageUrl) {
        setPreviews([initialData.imageUrl]);
      } else {
        setPreviews([]);
      }
    } else {
      // Reset form
      setFormData({
        title: "",
        price: "",
        duration: "",
        location: "",
        description: "",
        fixedDate: "",
        expectedMonth: "",
        bookingEndsIn: "",
      });
      setIncludedItems([]);
      setPlacesCovered([]);
      setPreviews([]);
      setImageFiles([]);
    }
  }, [initialData, isOpen]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  // --- Tag Handlers ---
  const handleAddItem = () => {
    if (newItemInput.trim()) {
      setIncludedItems([...includedItems, newItemInput.trim()]);
      setNewItemInput("");
    }
  };

  const handleAddPlace = () => {
    if (newPlaceInput.trim()) {
      setPlacesCovered([...placesCovered, newPlaceInput.trim()]);
      setNewPlaceInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Append Arrays as JSON strings
    data.append("includedItems", JSON.stringify(includedItems));
    data.append("placesCovered", JSON.stringify(placesCovered));

    imageFiles.forEach((file) => data.append("images", file));

    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-20">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {initialData ? "Edit Expedition" : "New Mission"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Configure the details for this journey.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900">
            <form id="tripForm" onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: VISUALS */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Mission Visuals
                </label>
                <div
                  className={`group relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.length > 0 ? "h-32 border-blue-500/50 bg-blue-500/10" : "h-48 border-slate-700 hover:border-blue-500 hover:bg-slate-800"}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  {previews.length === 0 ? (
                    <div className="text-center p-4">
                      <div className="w-14 h-14 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">
                        Upload Cover Photos
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload size={24} className="text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-blue-300">
                        {previews.length} Images Selected
                      </p>
                    </div>
                  )}
                </div>
                {previews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3">
                    {previews.map((src, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-700"
                      >
                        <img
                          src={src}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: CORE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mission Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Himalayan Expedition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Ladakh, India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Price (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="5 Days / 4 Nights"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Booking Ends
                  </label>
                  <input
                    value={formData.bookingEndsIn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bookingEndsIn: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="2 days before"
                  />
                </div>
              </div>

              {/* SECTION 3: SCHEDULING (Dynamic) */}
              <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={12} /> Fixed Launch Date
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
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white scheme-dark"
                  />
                  <p className="text-[10px] text-slate-500">
                    Select only if specific date is confirmed.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    OR Expected Month
                  </label>
                  <select
                    value={formData.expectedMonth}
                    disabled={!!formData.fixedDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedMonth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 outline-none text-white disabled:opacity-50"
                  >
                    <option value="">Select Flexible Month</option>
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

              {/* SECTION 4: TAGS (Places & Items) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Places Covered */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} /> Places Covered
                  </label>
                  <div className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all min-h-[50px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {placesCovered.map((place, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"
                        >
                          {place}
                          <button
                            type="button"
                            onClick={() =>
                              setPlacesCovered(
                                placesCovered.filter((_, i) => i !== index),
                              )
                            }
                            className="hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newPlaceInput}
                        onChange={(e) => setNewPlaceInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddPlace())
                        }
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm flex-1 h-8"
                        placeholder="Add place (e.g. Manali)..."
                      />
                      <button
                        type="button"
                        onClick={handleAddPlace}
                        className="text-emerald-500 hover:text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Included Items */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Included Items
                  </label>
                  <div className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all min-h-[50px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {includedItems.map((item, index) => (
                        <span
                          key={index}
                          className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() =>
                              setIncludedItems(
                                includedItems.filter((_, i) => i !== index),
                              )
                            }
                            className="hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newItemInput}
                        onChange={(e) => setNewItemInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddItem())
                        }
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm flex-1 h-8"
                        placeholder="Add item (e.g. Breakfast)..."
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-orange-500 hover:text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Itinerary
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600 resize-none"
                  placeholder="Enter the full mission details..."
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-20 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tripForm"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Create Mission"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripModal;
