import api from "./api";

export const fetchTrips = async () => {
  const response = await api.get("/trips");
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/delete/${id}`);
  return response.data;
};

export const createTrip = async (formData) => {
  // formData will now contain multiple 'images' entries
  const response = await api.post("/trips/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateTrip = async (id, formData) => {
  const response = await api.put(`/trips/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
