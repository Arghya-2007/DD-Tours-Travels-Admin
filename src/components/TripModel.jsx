import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TripModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    duration: "",
    location: "",
    description: "",
    expectedDate: "",
  });

  // Tag Input State
  const [includedItems, setIncludedItems] = useState([]);
  const [newItemInput, setNewItemInput] = useState("");

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
        expectedDate: initialData.expectedDate || "",
      });
      setIncludedItems(initialData.includedItems || []);

      if (initialData.images && initialData.images.length > 0) {
        setPreviews(initialData.images.map((img) => img.url));
      } else if (initialData.imageUrl) {
        setPreviews([initialData.imageUrl]);
      } else {
        setPreviews([]);
      }
    } else {
      setFormData({
        title: "",
        price: "",
        duration: "",
        location: "",
        description: "",
        expectedDate: "",
      });
      setIncludedItems([]);
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

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemInput.trim()) {
      setIncludedItems([...includedItems, newItemInput.trim()]);
      setNewItemInput("");
    }
  };

  const handleRemoveItem = (index) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Convert array to JSON string for backend
    data.append("includedItems", JSON.stringify(includedItems));

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
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
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
          className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-800 sticky top-0 z-20">
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialData ? "Edit Trip" : "Add New Trip"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill in the details below
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-800">
            <form id="tripForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-300">
                  Cover Photos
                </label>
                <div
                  className={`group relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.length > 0 ? "h-32 border-blue-500/50 bg-blue-500/10" : "h-48 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50"}`}
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
                      <div className="w-14 h-14 bg-slate-700 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">
                        Click to upload images
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload size={24} className="text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-blue-300">
                        Click to change selection
                      </p>
                    </div>
                  )}
                </div>
                {previews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3">
                    {previews.map((src, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-600"
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

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Trip Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. Darjeeling Escape"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Price (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. 15000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Duration
                  </label>
                  <input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. 5 Days / 4 Nights"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Location
                  </label>
                  <input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. West Bengal"
                  />
                </div>
              </div>

              {/* NEW FIELDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Expected Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Expected Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600 scheme-dark"
                  />
                </div>

                {/* 2. Included Items Tag Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    Included Items
                  </label>
                  <div className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {includedItems.map((item, index) => (
                        <span
                          key={index}
                          className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-600/30"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
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
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem(e)}
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm flex-1 h-8"
                        placeholder="Type & Press Enter..."
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-blue-500 hover:text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white placeholder-slate-600 resize-none"
                  placeholder="Detailed itinerary..."
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 sticky bottom-0 z-20 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
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
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripModal;
