import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authService";
import { Toaster, toast } from "react-hot-toast";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Shield,
} from "lucide-react";

// --- Configuration ---
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
];

const FIXED_CARD_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// --- Custom Input Component (Moved OUTSIDE to fix focus/visibility issues) ---
const InputField = ({
  label,
  type,
  value,
  setValue,
  icon: Icon,
  id,
  focusedInput,
  setFocusedInput,
}) => (
  <motion.div variants={itemVariants} className="relative mb-6 group">
    <div
      className={`absolute left-4 top-4 transition-colors duration-300 ${
        focusedInput === id || value ? "text-blue-600" : "text-gray-400"
      }`}
    >
      <Icon size={20} />
    </div>
    <motion.input
      whileFocus={{ scale: 1.01 }}
      type={type}
      id={id}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setFocusedInput(id)}
      onBlur={() => setFocusedInput(null)}
      // UPDATED: Darker background (bg-gray-100) and added border (border-gray-200) for visibility
      className={`w-full bg-gray-100 border-2 rounded-xl px-12 py-4 outline-none transition-all duration-300 font-medium text-gray-800 ${
        focusedInput === id
          ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10"
          : "border-gray-200 hover:border-gray-300"
      }`}
      placeholder=" "
    />
    <label
      htmlFor={id}
      className={`absolute left-12 transition-all duration-300 pointer-events-none ${
        focusedInput === id || value
          ? "-top-2.5 bg-white px-2 text-xs font-bold text-blue-600 rounded-full shadow-sm"
          : "top-4 text-gray-500 font-medium"
      }`}
    >
      {label}
    </label>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);

  // Background Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % BG_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This now calls your Node.js Backend
      await loginAdmin(email, password);

      toast.success("Welcome back, Admin!");

      // Redirect after a short delay for the toast to be visible
      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } catch (error) {
      // Show the specific message from your Backend (e.g., "Unauthorized: Email not recognized")
      const message = error.message || "Invalid Credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* 1. CINEMATIC BACKGROUND SLIDER */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={BG_SLIDES[currentImg]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" />
      </div>

      <Toaster position="top-right" />

      {/* 2. MAIN CARD WRAPPER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* 3. INNER CARD */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-white h-162.5 rounded-[35px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex"
        >
          {/* LEFT SIDE: "Breathing" Fixed Image */}
          <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
            <motion.img
              src={FIXED_CARD_IMAGE}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              alt="Admin Visual"
            />

            <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 via-blue-900/20 to-transparent z-10" />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative z-20 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Admin Portal</h3>
                  <p className="text-blue-200 text-xs">Secure Connection</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-300 text-xs font-semibold bg-green-500/20 py-1.5 px-3 rounded-lg w-fit">
                <CheckCircle2 size={14} />
                <span>System Online</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center relative bg-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative z-10"
            >
              <motion.div variants={itemVariants} className="mb-10">
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-slate-500 mt-2 text-lg">
                  Please enter your details to sign in.
                </p>
              </motion.div>

              <form onSubmit={handleLogin}>
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  setValue={setEmail}
                  icon={Mail}
                  id="email"
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                />

                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  setValue={setPassword}
                  icon={Lock}
                  id="password"
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                />

                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center mb-8"
                >
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600" />
                      <CheckCircle2
                        size={12}
                        className="text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors font-medium">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 font-bold hover:text-blue-700 transition-colors"
                  >
                    Recovery?
                  </a>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 30px -10px rgba(37, 99, 235, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                © 2026 DD TOUR & TRAVEL
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
