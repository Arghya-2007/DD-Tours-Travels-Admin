import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  X,
  Image as ImageIcon,
  Youtube,
  Facebook,
  Search,
  CheckCircle,
  PenTool,
  Clock,
} from "lucide-react";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    author: "Command HQ",
    category: "Expedition",
    readTime: "5 min",
    image: "",
    content: "",
    youtubeUrl: "",
    facebookUrl: "",
  });

  // --- 1. FETCH BLOGS ---
  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data);
    } catch (error) {
      toast.error("Failed to load intelligence reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // --- 2. HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      return toast.error("Title and Image are mandatory.");
    }

    setSubmitting(true);
    try {
      await api.post("/blogs/add", formData);
      toast.success("New Dispatch Published!");
      setIsCreating(false);
      setFormData({
        title: "",
        excerpt: "",
        author: "Command HQ",
        category: "Expedition",
        readTime: "5 min",
        image: "",
        content: "",
        youtubeUrl: "",
        facebookUrl: "",
      });
      fetchBlogs();
    } catch (error) {
      toast.error("Transmission Failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. HANDLE DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Confirm Redaction? This cannot be undone.")) return;

    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Report Redacted.");
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (error) {
      toast.error("Delete Failed.");
    }
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <PenTool size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Mission Intel
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-lg text-sm ml-1">
            Manage field reports and public dispatches.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
          >
            <Plus size={18} /> New Dispatch
          </button>
        )}
      </div>

      {/* --- MAIN CONTENT --- */}
      {isCreating ? (
        /* --- CREATE FORM (Split View) --- */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Form Side */}
          <div className="bg-[#1c1917] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={20} className="text-orange-500" /> Compose
                Report
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Mission Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Protocol Alpha: Jungle Survival"
              />

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
                <Input
                  label="Read Time"
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData({ ...formData, readTime: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
                <Input
                  label="Cover Image URL"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                  Brief Excerpt (Summary)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full bg-[#0c0a09] border border-white/10 rounded-xl p-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none h-32 resize-none transition-all"
                  placeholder="Brief summary for the card view..."
                />
              </div>

              {/* Video Links */}
              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <Youtube
                    size={18}
                    className="absolute top-10 left-4 text-red-500"
                  />
                  <Input
                    label="YouTube Link (Optional)"
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeUrl: e.target.value })
                    }
                    className="pl-12"
                  />
                </div>
                <div className="relative">
                  <Facebook
                    size={18}
                    className="absolute top-10 left-4 text-blue-500"
                  />
                  <Input
                    label="Facebook Link (Optional)"
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookUrl: e.target.value })
                    }
                    className="pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={20} /> Publish Report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Side (Sticky) */}
          <div className="hidden lg:block space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">
              Live Preview
            </h3>

            {/* Reusing exact card design for accuracy */}
            <div className="blog-card flex flex-col bg-[#1c1917] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={
                    formData.image ||
                    "https://via.placeholder.com/800x400?text=Upload+Cover"
                  }
                  alt="Preview"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {formData.category || "CATEGORY"}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                  <span className="text-orange-400">{formData.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formData.readTime}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white uppercase mb-4 leading-tight line-clamp-2">
                  {formData.title || "Mission Title Here"}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                  {formData.excerpt ||
                    "Your summary text will appear here. This gives readers a quick overview of the intelligence report."}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                  <span className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group cursor-pointer">
                    Read Report{" "}
                    <span className="text-orange-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </span>
                  <div className="flex gap-3">
                    {formData.youtubeUrl && (
                      <div className="p-2 bg-white/5 rounded-full">
                        <Youtube size={16} className="text-red-500" />
                      </div>
                    )}
                    {formData.facebookUrl && (
                      <div className="p-2 bg-white/5 rounded-full">
                        <Facebook size={16} className="text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- LIST VIEW --- */
        <div className="bg-[#1c1917] rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 size={40} className="animate-spin text-orange-500" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-20 text-center text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">
                No reports found in the archives.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 text-orange-500 hover:text-orange-400 text-sm font-bold uppercase tracking-wider"
              >
                Create First Report
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Report Title</th>
                    <th className="p-6">Category</th>
                    <th className="p-6">Author</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={blog.image}
                            alt=""
                            className="w-16 h-12 rounded-lg object-cover bg-gray-800 border border-white/10"
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 max-w-[200px] md:max-w-xs">
                              {blog.title}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-1">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20 uppercase tracking-wider">
                          {blog.category}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-slate-400 font-medium">
                        {blog.author}
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2.5 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                          title="Redact Report"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Input Helper Component
const Input = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className={`bg-[#0c0a09] border border-white/10 rounded-xl p-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder-slate-700 ${className}`}
    />
  </div>
);

export default AdminBlogs;
