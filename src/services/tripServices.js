import api from "./api";

// 1. GET ALL
export const fetchTrips = async () => {
  const response = await api.get("/trips");
  return response.data;
};

// 2. DELETE
export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/delete/${id}`);
  return response.data;
};

// 3. CREATE
// Fixed URL to match router.post("/create")
export const createTrip = async (formData) => {
  // NOTE: Do NOT set "Content-Type" manually for FormData.
  // Axios/Browser will set it automatically with the correct boundary.
  const response = await api.post("/trips/create", formData);
  return response.data;
};

// 4. UPDATE
// Fixed Headers (removed manual Content-Type)
export const updateTrip = async (id, formData) => {
  const response = await api.put(`/trips/update/${id}`, formData);
  return response.data;
};
