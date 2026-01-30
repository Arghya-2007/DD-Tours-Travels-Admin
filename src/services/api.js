import axios from "axios";

// Create an Axios instance
const api = axios.create({
  // Logic: Use the Vercel variable if it exists; otherwise, fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatic Token Injector
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
