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
  MoreVertical,
  Globe,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { gsap } from "gsap";
import TripModal from "../components/TripModel";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  // Refs for GSAP
  const containerRef = useRef(null);

  useEffect(() => {
    loadTrips();
  }, []);

  // GSAP Animation Trigger
  useEffect(() => {
    if (!loading && trips.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".trip-card",
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // Important for hover effects to work after animation
          },
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, trips]); // Removed searchTerm to prevent re-animating on every keystroke

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
    const loadingToast = toast.loading(
      editingTrip ? "Updating mission..." : "Initializing new mission...",
    );
    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, formData);
        toast.success("Mission parameters updated!", { id: loadingToast });
      } else {
        await createTrip(formData);
        toast.success("New Expedition initialized!", { id: loadingToast });
      }
      loadTrips();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Operation failed.", { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm("⚠️ WARNING: This will permanently delete the mission. Confirm?")
    ) {
      const loadingToast = toast.loading("Deleting mission...");
      try {
        await deleteTrip(id);

        // Animate out
        gsap.to(`#card-${id}`, {
          scale: 0.9,
          opacity: 0,
          height: 0,
          marginBottom: 0,
          duration: 0.3,
          onComplete: () => {
            setTrips((prev) => prev.filter((t) => t.id !== id));
            toast.success("Mission deleted.", { id: loadingToast });
          },
        });
      } catch (error) {
        toast.error("Could not delete.", { id: loadingToast });
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
            background: "#1c1917",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Globe size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Expedition Control
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-lg text-sm ml-1">
            Manage active missions, flight paths, and crew assignments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative group w-full sm:w-80">
            <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <Search
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search active missions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#1c1917] border border-white/10 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm shadow-xl"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsModalOpen(true);
            }}
            className="relative overflow-hidden bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 group text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            <span>New Mission</span>
          </button>
        </div>
      </div>

      {/* --- GRID DISPLAY --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 bg-[#1c1917] rounded-[2rem] animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip) => (
            <div
              id={`card-${trip.id}`}
              key={trip.id}
              className="trip-card group relative bg-[#1c1917] hover:bg-[#23201e] border border-white/5 hover:border-white/10 rounded-[2rem] overflow-hidden transition-all duration-300 flex flex-col h-full shadow-2xl shadow-black/50"
            >
              {/* Image Header */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    trip.images?.[0]?.url ||
                    trip.imageUrl ||
                    "https://via.placeholder.com/400x300?text=No+Signal"
                  }
                  alt={trip.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent opacity-90" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {trip.fixedDate ? (
                    <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                      <Calendar size={10} />{" "}
                      {new Date(trip.fixedDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="bg-blue-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                      <Clock size={10} /> Flexible
                    </span>
                  )}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-white font-bold text-lg shadow-xl">
                  ₹{Number(trip.price).toLocaleString()}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col relative">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <MapPin size={14} className="text-slate-500" />
                    <span className="truncate">
                      {trip.location || "Classified"}
                    </span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full mx-1" />
                    <Clock size={14} className="text-slate-500" />
                    <span>{trip.duration || "TBA"}</span>
                  </div>
                </div>

                {/* Places Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {trip.placesCovered?.slice(0, 3).map((place, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5"
                    >
                      {place}
                    </span>
                  ))}
                  {(trip.placesCovered?.length || 0) > 3 && (
                    <span className="text-[10px] text-slate-500 px-1 py-1">
                      +{trip.placesCovered.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setEditingTrip(trip);
                      setIsModalOpen(true);
                    }}
                    className="py-2.5 rounded-xl bg-white/5 text-slate-300 font-semibold hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Kept separate for logic preservation */}
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
