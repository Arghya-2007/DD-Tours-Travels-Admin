import api from "./api"; // This imports your axios instance

// --- NEW: Backend Admin Login ---
export const loginAdmin = async (email, password) => {
  try {
    // We now send the credentials to YOUR Node.js server, not Firebase
    const response = await api.post("/admin/login", { email, password });

    // If successful, the backend sends back a 'token'
    if (response.data.token) {
      // 1. Save the JWT Token
      localStorage.setItem("token", response.data.token);

      // 2. Save the Admin Email (for the sidebar profile)
      localStorage.setItem("adminEmail", response.data.adminEmail);

      return response.data;
    }
  } catch (error) {
    // Throw the error message from the backend (e.g., "Incorrect password")
    throw error.response ? error.response.data : new Error("Login failed");
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminEmail");
  window.location.href = "/login";
};

// Check if currently logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  // In a real app, you might check if the token is expired here
  return !!token;
};
