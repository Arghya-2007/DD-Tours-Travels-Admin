import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authService";
import { Toaster, toast } from "react-hot-toast";
import { gsap } from "gsap";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Shield,
  LayoutDashboard,
  Globe,
} from "lucide-react";

// --- Configuration ---
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=2000&auto=format&fit=crop", // Dark Mountain
  "https://images.unsplash.com/photo-1533240332313-0dbdd31c16ca?q=80&w=2000&auto=format&fit=crop", // Night Camping
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop", // High Peak
];

const FIXED_CARD_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop"; // Starry Mountains

// --- Input Component ---
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
  <div className="input-group relative mb-6 group opacity-0 translate-y-4">
    <div
      className={`absolute left-4 top-4 transition-colors duration-300 ${
        focusedInput === id || value ? "text-orange-500" : "text-slate-500"
      }`}
    >
      <Icon size={20} />
    </div>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setFocusedInput(id)}
      onBlur={() => setFocusedInput(null)}
      className={`w-full bg-[#1c1917] border-2 rounded-xl px-12 py-4 outline-none transition-all duration-300 font-medium text-white placeholder-transparent ${
        focusedInput === id
          ? "border-orange-500 bg-[#252220] shadow-lg shadow-orange-500/10 scale-[1.01]"
          : "border-white/10 hover:border-white/20"
      }`}
      placeholder=" "
    />
    <label
      htmlFor={id}
      className={`absolute left-12 transition-all duration-300 pointer-events-none ${
        focusedInput === id || value
          ? "-top-2.5 bg-[#1c1917] px-2 text-xs font-bold text-orange-500 rounded-full"
          : "top-4 text-slate-500 font-medium"
      }`}
    >
      {label}
    </label>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);

  // Refs for GSAP
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const badgeRef = useRef(null);

  // Background Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % BG_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // --- GSAP ANIMATIONS ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Main Card Entrance
      gsap.fromTo(
        cardRef.current,
        { y: 100, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.2,
        },
      );

      // 2. Image Breathing
      gsap.to(".hero-image", {
        scale: 1.1,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "linear",
      });

      // 3. Floating Badge
      gsap.fromTo(
        badgeRef.current,
        { y: 0 },
        { y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" },
      );

      // 4. Staggered Form Elements
      gsap.to(".input-group, .form-header, .form-footer", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.6,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(email, password);
      toast.success("Access Granted.");

      // Animate Card Out before navigating
      gsap.to(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: "power2.in",
      });

      setTimeout(() => navigate("/admin/dashboard"), 600);
    } catch (error) {
      toast.error(error.message || "Invalid Credentials");

      // Error Shake Animation
      gsap.fromTo(
        cardRef.current,
        { x: -10 },
        {
          x: 10,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: "none",
          clearProps: "x",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden bg-[#050505]"
    >
      {/* 1. CINEMATIC BACKGROUND SLIDER */}
      <div className="absolute inset-0 z-0">
        {BG_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImg ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide}
              className="w-full h-full object-cover"
              alt="Background"
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
          </div>
        ))}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1c1917",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />

      {/* 2. MAIN CARD */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-5xl bg-[#0c0a09] h-auto lg:h-[650px] rounded-[32px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col lg:flex-row"
      >
        {/* LEFT SIDE: Visual */}
        <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
          <img
            src={FIXED_CARD_IMAGE}
            className="hero-image absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Admin Visual"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent z-10" />

          {/* Floating Glass Badge */}
          <div
            ref={badgeRef}
            className="relative z-20 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-72 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/20">
                <Shield size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">
                  Command Portal
                </h3>
                <p className="text-slate-400 text-xs">
                  Restricted Access Level 1
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 py-2 px-3 rounded-lg w-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems Operational</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-[#0c0a09]">
          {/* Subtle Glow Effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="form-header mb-10 opacity-0 translate-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Globe className="text-orange-500" size={20} />
                </div>
                <span className="text-orange-500 font-bold tracking-[0.2em] text-xs uppercase">
                  DD Tours & Travels
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-400 mt-2 text-lg">
                Enter your credentials to access the terminal.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <InputField
                label="Command Email"
                type="email"
                value={email}
                setValue={setEmail}
                icon={Mail}
                id="email"
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />

              <InputField
                label="Secure Password"
                type="password"
                value={password}
                setValue={setPassword}
                icon={Lock}
                id="password"
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />

              <div className="form-footer flex justify-between items-center mb-8 opacity-0 translate-y-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded bg-[#1c1917] transition-colors peer-checked:bg-orange-600 peer-checked:border-orange-600" />
                    <CheckCircle2
                      size={12}
                      className="text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity"
                    />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors font-medium">
                    Keep me signed in
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-orange-500 font-bold hover:text-orange-400 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                disabled={loading}
                className="form-footer w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 opacity-0 translate-y-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Initialize Session <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="form-footer mt-12 text-center opacity-0 translate-y-4">
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                Secure Connection • {new Date().getFullYear()} DD Tours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
