import React, { useEffect, useState } from "react";
import {
  fetchTrips,
  deleteTrip,
  createTrip,
  updateTrip,
} from "../services/tripServices";
import {
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Clock,
  Search,
  PackageOpen,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import TripModal from "../components/TripModel";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await fetchTrips();
      setTrips(data);
    } catch (error) {
      toast.error("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, formData);
        toast.success("Updated successfully!");
      } else {
        await createTrip(formData);
        toast.success("Trip created!");
      }
      loadTrips();
    } catch (error) {
      toast.error("Operation failed.");
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this trip permanently?")) {
      try {
        await deleteTrip(id);
        setTrips(trips.filter((t) => t.id !== id));
        toast.success("Deleted successfully.");
      } catch (error) {
        toast.error("Could not delete.");
      }
    }
  };

  const getCoverImage = (trip) => {
    if (trip.images && trip.images.length > 0) return trip.images[0].url;
    if (trip.imageUrl) return trip.imageUrl;
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-400 mx-auto">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#fff",
            border: "1px solid #334155",
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Trip Packages
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your travel catalog and offerings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder-slate-600"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
          >
            <Plus size={20} strokeWidth={2.5} /> <span>Add Trip</span>
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-slate-800/50 rounded-3xl h-100 animate-pulse border border-slate-700"
            ></div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
        >
          {filteredTrips.map((trip) => (
            <motion.div
              variants={itemVariants}
              key={trip.id}
              className="bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-700 group flex flex-col h-full hover:shadow-2xl hover:border-blue-500/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img
                  src={getCoverImage(trip)}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-white border border-white/10">
                  ₹{trip.price.toLocaleString()}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {trip.title}
                </h3>

                <div className="flex items-center gap-4 text-slate-400 text-sm mb-4 font-medium">
                  <div className="flex items-center gap-1.5 bg-slate-700/50 px-2 py-1 rounded-md border border-slate-700">
                    <Clock size={16} className="text-blue-400" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-700/50 px-2 py-1 rounded-md border border-slate-700">
                    <MapPin size={16} className="text-emerald-400" />
                    <span>{trip.location}</span>
                  </div>
                </div>

                {/* NEW: Date & Items Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.expectedDate && (
                    <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-md font-semibold">
                      📅 {new Date(trip.expectedDate).toLocaleDateString()}
                    </span>
                  )}
                  {trip.includedItems && trip.includedItems.length > 0 && (
                    <span className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-1 rounded-md font-semibold">
                      ✨ {trip.includedItems.length} Items
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {trip.description || "No description provided."}
                </p>

                <div className="flex gap-3 pt-4 border-t border-slate-700 mt-auto">
                  <button
                    onClick={() => handleOpenEdit(trip)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <TripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTrip}
      />
    </div>
  );
};

export default Trips;
