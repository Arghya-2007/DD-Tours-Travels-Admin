import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your local backend URL
});

// Automatic Token Injector
// This checks if you have a token saved and adds it to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
