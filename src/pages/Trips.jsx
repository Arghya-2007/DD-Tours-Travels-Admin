import React, { useEffect, useState, useRef } from "react";
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
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { gsap } from "gsap";
import TripModal from "../components/TripModal";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  // Refs for GSAP
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    loadTrips();
  }, []);

  // GSAP Animation Trigger when trips are loaded
  useEffect(() => {
    if (!loading && trips.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".trip-card",
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, trips, searchTerm]);

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

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, formData);
        toast.success("Mission updated successfully!");
      } else {
        await createTrip(formData);
        toast.success("New Expedition created!");
      }
      loadTrips();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to cancel this mission permanently?")) {
      try {
        await deleteTrip(id);
        // Animate out before removing from state
        gsap.to(`#card-${id}`, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          onComplete: () => setTrips((prev) => prev.filter((t) => t.id !== id)),
        });
        toast.success("Mission deleted.");
      } catch (error) {
        toast.error("Could not delete.");
      }
    }
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full relative" ref={containerRef}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #334155",
          },
        }}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">
            Expedition Control
          </h1>
          <p className="text-slate-400 font-medium max-w-lg">
            Manage your active missions, flight paths, and crew assignments from
            a single command center.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          {/* Glass Search Bar */}
          <div className="relative group w-full sm:w-80">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <Search
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search expeditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 placeholder-slate-600 transition-all relative z-10"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsModalOpen(true);
            }}
            className="relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={20} strokeWidth={2.5} />
            <span className="relative z-10">New Mission</span>
          </button>
        </div>
      </div>

      {/* --- GRID --- */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-500 animate-pulse">
          Loading Mission Data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip) => (
            <div
              id={`card-${trip.id}`}
              key={trip.id}
              className="trip-card group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2rem] overflow-hidden hover:border-slate-600 transition-colors duration-300 flex flex-col h-full"
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    trip.images?.[0]?.url ||
                    trip.imageUrl ||
                    "https://via.placeholder.com/400x300"
                  }
                  alt={trip.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-xl">
                  ₹{Number(trip.price).toLocaleString()}
                </div>

                {/* Status Badge (Logic: If Fixed Date exists, it's Scheduled, else Flexible) */}
                <div className="absolute top-4 left-4">
                  {trip.fixedDate ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      <Calendar size={12} /> Scheduled
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      <Clock size={12} /> Flexible
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {trip.title}
                </h3>

                {/* Places Covered (Pills) */}
                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  {trip.placesCovered?.slice(0, 3).map((place, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700"
                    >
                      {place}
                    </span>
                  ))}
                  {(trip.placesCovered?.length || 0) > 3 && (
                    <span className="text-[10px] text-slate-500 px-1 py-1">
                      +{trip.placesCovered.length - 3} more
                    </span>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-400 mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    <span>{trip.duration || "TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400" />
                    <span className="truncate">
                      {trip.location || "Remote"}
                    </span>
                  </div>
                  {/* New Fields Display */}
                  <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-slate-700/50">
                    <AlertCircle size={14} className="text-orange-400" />
                    <span className="text-slate-300 text-xs">
                      Bookings end:{" "}
                      <span className="text-white font-medium">
                        {trip.bookingEndsIn || "N/A"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => {
                      setEditingTrip(trip);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-slate-700 hover:border-blue-500"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-slate-700 hover:border-red-500/50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal is passed the edit data */}
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
