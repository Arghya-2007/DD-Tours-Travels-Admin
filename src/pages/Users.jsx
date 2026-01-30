import React, { useEffect, useState } from "react";
import { fetchUsers, deleteUser } from "../services/userService";
import {
  Search,
  Trash2,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATE
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageHistory, setPageHistory] = useState([]); // Stack to keep track of previous tokens
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 8; // Adjust based on your screen size preference

  const currentAdminEmail = localStorage.getItem("adminEmail");

  useEffect(() => {
    // Load initial page (no token)
    loadUsers();
  }, []);

  const loadUsers = async (token = "") => {
    setLoading(true);
    try {
      // Fetch specifically 8 users starting from 'token'
      const data = await fetchUsers(USERS_PER_PAGE, token);

      setUsers(data.users);
      setNextPageToken(data.nextPageToken); // Save token for Next button
    } catch (error) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextPageToken) {
      // Save current token to history before moving forward (so we can go back)
      // Note: We need the token required to fetch *this* current page, not the next one.
      // But Firebase structure makes "Previous" hard.
      // Strategy: We push the *current* token state to history.

      // Actually, simplest way for Firebase Auth:
      // We can't easily go "Back" without storing the tokens of each page we visited.
      setPageHistory([...pageHistory, nextPageToken]); // This logic is tricky with Firebase, simplifying:

      // Let's just load the next set
      loadUsers(nextPageToken);
      setPageHistory([...pageHistory, nextPageToken]); // Store token we just used? No.
      // Firebase only gives "Next Page". To go back, we have to reload from start or cache.
      // For this tutorial, let's implement a simple "Load More" style or "Next/Reset".
      // Implementing robust "Previous" in Firebase Auth is complex.
      // Let's stick to "Next" -> and a "Reset to Start" if they get lost, OR simple Page Count.

      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setPageHistory([]);
    setCurrentPage(1);
    setNextPageToken(null);
    loadUsers(""); // Reload from start
  };

  const handleDelete = async (uid, email) => {
    if (email === currentAdminEmail) {
      toast.error("You cannot delete your own admin account!");
      return;
    }
    if (confirm(`Delete user ${email}?`)) {
      try {
        await deleteUser(uid);
        setUsers(users.filter((user) => user.uid !== uid));
        toast.success("User deleted.");
      } catch (error) {
        toast.error("Deletion failed.");
      }
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isAdmin = (email) =>
    ["admin@ddtours.com", "arghya@test.com"].includes(email);

  return (
    <div className="w-full max-w-480 mx-auto min-h-[80vh]">
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

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            User Base
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Page {currentPage} • Managing active accounts
          </p>
        </div>

        {/* Note: Server-side search for Firebase Auth is hard (only exact email match). 
            We removed the filter bar here because it implies client-side filtering 
            which crashes high-traffic apps. */}
        <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400">
          Showing {users.length} users per page
        </div>
      </div>

      {/* --- Content Area --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-slate-800/50 rounded-3xl h-64 animate-pulse border border-slate-700/50"
            />
          ))}
        </div>
      ) : (
        <div className="min-h-100">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {users.map((user) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={user.uid}
                  className="bg-slate-800 rounded-3xl p-6 border border-slate-700 hover:border-blue-500/40 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all" />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-bold text-xl shadow-inner overflow-hidden">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="av"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.email?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate pr-2">
                          {user.displayName || "User"}
                        </h3>
                        {isAdmin(user.email) ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full mt-1">
                            <ShieldCheck size={12} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full mt-1">
                            <UserIcon size={12} /> Member
                          </span>
                        )}
                      </div>
                    </div>
                    {!isAdmin(user.email) && (
                      <button
                        onClick={() => handleDelete(user.uid, user.email)}
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 relative z-10 mt-auto">
                    <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                      <Mail size={16} className="text-blue-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <Calendar size={12} /> Joined
                        </div>
                        <div className="text-slate-200 text-sm font-semibold truncate">
                          {formatDate(user.metadata.creationTime)}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <Clock size={12} /> Last Login
                        </div>
                        <div className="text-slate-200 text-sm font-semibold truncate">
                          {formatDate(user.metadata.lastSignInTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* --- Pagination Controls --- */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {/* Simple Reset Button instead of 'Prev' because Firebase tokens are one-way */}
            {currentPage > 1 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
              >
                <ChevronLeft size={20} /> Back to Start
              </button>
            )}

            {nextPageToken && (
              <button
                onClick={handleNextPage}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 active:scale-95 transition-all"
              >
                Next Page <ChevronRight size={20} />
              </button>
            )}

            {!nextPageToken && users.length > 0 && (
              <div className="text-slate-500 font-medium">End of list</div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-slate-300">No users found</h3>
        </div>
      )}
    </div>
  );
};

export default Users;
