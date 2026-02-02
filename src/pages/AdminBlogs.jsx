import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
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
    content: "", // This would be the full HTML/Markdown body
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
      fetchBlogs(); // Refresh list
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
    <div className="p-6 md:p-10 bg-[#0c0a09] min-h-screen text-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-header text-white uppercase mb-2">
              Mission Control
            </h1>
            <p className="text-gray-500 text-sm">
              Manage field reports and intelligence.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20"
          >
            <Plus size={18} /> New Dispatch
          </button>
        </div>

        {/* --- MAIN CONTENT --- */}
        {isCreating ? (
          /* --- CREATE FORM --- */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Side */}
            <div className="bg-[#1c1917] p-8 rounded-3xl border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-header text-white uppercase">
                  Compose Report
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Mission Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Protocol Alpha: Jungle Survival"
                />

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                    Brief Excerpt (Summary)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none h-24 resize-none"
                    placeholder="Brief summary for the card view..."
                  />
                </div>

                {/* Video Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Youtube
                      size={16}
                      className="absolute top-10 left-3 text-red-500"
                    />
                    <Input
                      label="YouTube Link (Optional)"
                      value={formData.youtubeUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, youtubeUrl: e.target.value })
                      }
                      className="pl-10" // Add padding for icon
                    />
                  </div>
                  <div className="relative">
                    <Facebook
                      size={16}
                      className="absolute top-10 left-3 text-blue-500"
                    />
                    <Input
                      label="Facebook Link (Optional)"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facebookUrl: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={18} /> Publish Report
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Side */}
            <div className="hidden lg:block">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Live Preview
              </h3>
              {/* Reusing the exact card design from your Blogs.jsx for accuracy */}
              <div className="blog-card flex flex-col bg-[#1c1917] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={
                      formData.image ||
                      "https://via.placeholder.com/800x400?text=No+Image"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {formData.category || "CATEGORY"}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-header text-white uppercase mb-4 leading-tight">
                    {formData.title || "Mission Title Here"}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {formData.excerpt ||
                      "Your summary text will appear here. This gives readers a quick overview of the intelligence report."}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                      Read Report <span className="text-primary">→</span>
                    </span>
                    <div className="flex gap-2">
                      {formData.youtubeUrl && (
                        <Youtube size={16} className="text-gray-500" />
                      )}
                      {formData.facebookUrl && (
                        <Facebook size={16} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- LIST VIEW --- */
          <div className="bg-[#1c1917] rounded-3xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No reports found in the archives.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={blog.image}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                            />
                            <div>
                              <p className="font-bold text-white group-hover:text-primary transition-colors">
                                {blog.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-gray-400">
                          <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10">
                            {blog.category}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-gray-400">
                          {blog.author}
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-500 transition-colors"
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
    </div>
  );
};

// Simple Input Helper
const Input = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className={`bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-all ${className}`}
    />
  </div>
);

export default AdminBlogs;
