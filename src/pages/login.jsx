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
} from "lucide-react";

// --- Configuration ---
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
];

const FIXED_CARD_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop";

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
    {" "}
    {/* GSAP Target: opacity-0 initially */}
    <div
      className={`absolute left-4 top-4 transition-colors duration-300 ${
        focusedInput === id || value ? "text-blue-600" : "text-gray-400"
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
      className={`w-full bg-gray-50 border-2 rounded-xl px-12 py-4 outline-none transition-all duration-300 font-medium text-gray-800 ${
        focusedInput === id
          ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10 scale-[1.01]"
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
  const bgImageRef = useRef(null);
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
      // 1. Main Card Entrance (Elastic Pop)
      gsap.fromTo(
        cardRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.2)",
          delay: 0.2,
        },
      );

      // 2. Left Side Image Breathing
      gsap.to(".hero-image", {
        scale: 1.1,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "linear",
      });

      // 3. Floating Badge (Gravity effect)
      gsap.fromTo(
        badgeRef.current,
        { y: 0 },
        { y: -15, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" },
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
        scale: 0.9,
        opacity: 0,
        y: -50,
        duration: 0.5,
      });

      setTimeout(() => navigate("/admin/dashboard"), 800);
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
      className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden bg-slate-950"
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
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]" />
          </div>
        ))}
      </div>

      <Toaster position="top-right" />

      {/* 2. MAIN CARD */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-5xl bg-white h-auto lg:h-[650px] rounded-[35px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row"
      >
        {/* LEFT SIDE: Visual (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
          <img
            src={FIXED_CARD_IMAGE}
            className="hero-image absolute inset-0 w-full h-full object-cover opacity-80"
            alt="Admin Visual"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent z-10" />

          {/* Floating Glass Badge */}
          <div
            ref={badgeRef}
            className="relative z-20 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Admin Portal</h3>
                <p className="text-blue-200 text-xs">Secure Gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold bg-emerald-500/20 py-1.5 px-3 rounded-lg w-fit">
              <CheckCircle2 size={14} />
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-white">
          {/* Subtle Glow Effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10">
            <div className="form-header mb-10 opacity-0 translate-y-4">
              {" "}
              {/* GSAP Target */}
              <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard className="text-blue-600" size={24} />
                <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">
                  DD Tours & Travels
                </span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 mt-2 text-lg">
                Enter your credentials to access the command center.
              </p>
            </div>

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

              <div className="form-footer flex justify-between items-center mb-8 opacity-0 translate-y-4">
                {" "}
                {/* GSAP Target */}
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
              </div>

              <button
                disabled={loading}
                className="form-footer w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 opacity-0 translate-y-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="form-footer mt-12 text-center opacity-0 translate-y-4">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                © 2026 DD TOURS & TRAVELS • SECURE SERVER
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
