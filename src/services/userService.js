import api from "./api";

// Accepts limit and the specific page token
export const fetchUsers = async (limit = 10, nextPageToken = "") => {
  // Construct URL query: /users/all?limit=10&nextPageToken=abc123...
  const query = `/users?limit=${limit}${nextPageToken ? `&nextPageToken=${nextPageToken}` : ""}`;

  const response = await api.get(query);
  return response.data; // Now returns { users: [...], nextPageToken: "..." }
};

export const deleteUser = async (uid) => {
  const response = await api.delete(`/users/delete/${uid}`);
  return response.data;
};
