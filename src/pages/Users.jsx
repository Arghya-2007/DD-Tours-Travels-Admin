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
  Users as UsersIcon,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATE
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 8;

  const currentAdminEmail = localStorage.getItem("adminEmail");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (token = "") => {
    setLoading(true);
    try {
      const data = await fetchUsers(USERS_PER_PAGE, token);
      setUsers(data.users);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextPageToken) {
      loadUsers(nextPageToken);
      setPageHistory([...pageHistory, nextPageToken]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setPageHistory([]);
    setCurrentPage(1);
    setNextPageToken(null);
    loadUsers("");
  };

  const handleDelete = async (uid, email) => {
    if (email === currentAdminEmail) {
      toast.error("Self-termination denied. Command override.");
      return;
    }
    if (confirm(`Revoke access for ${email}?`)) {
      try {
        await deleteUser(uid);
        setUsers(users.filter((user) => user.uid !== uid));
        toast.success("User access revoked.");
      } catch (error) {
        toast.error("Revocation failed.");
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <UsersIcon size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Operative Database
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-lg text-sm ml-1">
            Page {currentPage} • Managing active personnel accounts.
          </p>
        </div>

        <div className="bg-[#1c1917] px-4 py-2 rounded-lg border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          {users.length} Records Loaded
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-[#1c1917] rounded-[2rem] h-72 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {users.map((user) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={user.uid}
                  className="bg-[#1c1917] rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col shadow-xl"
                >
                  {/* Decorative Glow */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all" />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#252220] border border-white/5 flex items-center justify-center text-slate-300 font-bold text-xl shadow-inner overflow-hidden">
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
                          {user.displayName || "Unknown Agent"}
                        </h3>
                        {isAdmin(user.email) ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full mt-1">
                            <ShieldCheck size={12} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full mt-1">
                            <UserIcon size={12} /> Explorer
                          </span>
                        )}
                      </div>
                    </div>
                    {!isAdmin(user.email) && (
                      <button
                        onClick={() => handleDelete(user.uid, user.email)}
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Revoke Access"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 relative z-10 mt-auto">
                    <div className="flex items-center gap-3 text-slate-400 text-sm bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <Mail size={16} className="text-blue-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <Calendar size={12} /> Joined
                        </div>
                        <div className="text-slate-200 text-xs font-mono font-semibold truncate">
                          {formatDate(user.metadata.creationTime)}
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <Clock size={12} /> Last Seen
                        </div>
                        <div className="text-slate-200 text-xs font-mono font-semibold truncate">
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
            {currentPage > 1 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10 text-sm uppercase tracking-wider"
              >
                <ChevronLeft size={18} /> Restart
              </button>
            )}

            {nextPageToken && (
              <button
                onClick={handleNextPage}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                Next Page <ChevronRight size={18} />
              </button>
            )}

            {!nextPageToken && users.length > 0 && (
              <div className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">
                End of Database
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <UsersIcon size={32} className="opacity-50 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">
            No operatives found
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            The user database is currently empty.
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
