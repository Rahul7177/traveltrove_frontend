import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/password", data),
};

export const guidesAPI = {
  getAll: (params) => api.get("/guides", { params }),
  getById: (id) => api.get(`/guides/${id}`),
  create: (data) => api.post("/guides", data),
  update: (id, data) => api.put(`/guides/${id}`, data),
  delete: (id) => api.delete(`/guides/${id}`),
  searchSuggestions: (query, limit = 6) =>
    api.get("/guides", { params: { search: query, limit } }),
};

export const itinerariesAPI = {
  getAll: (params) => api.get("/itineraries", { params }),
  getMy: () => api.get("/itineraries/my"),
  getLiked: () => api.get("/itineraries/liked"),
  getById: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post("/itineraries", data),
  update: (id, data) => api.put(`/itineraries/${id}`, data),
  delete: (id) => api.delete(`/itineraries/${id}`),
  like: (id) => api.post(`/itineraries/${id}/like`),
};

export const reviewsAPI = {
  getForTarget: (targetModel, targetId, params) =>
    api.get(`/reviews/${targetModel}/${targetId}`, { params }),
  create: (data) => api.post("/reviews", data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const usersAPI = {
  saveGuide: (id) => api.post(`/users/save-guide/${id}`),
  saveItinerary: (id) => api.post(`/users/save-itinerary/${id}`),
  getSaved: () => api.get("/users/saved"),
  updateProfile: (data) => api.put("/users/profile", data),
};

export const groupsAPI = {
  getAll: () => api.get("/groups"),
  getAllIncludingPrivate: () => api.get("/groups/all"),
  getMy: () => api.get("/groups/my"),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post("/groups", data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  join: (id, data) => api.post(`/groups/${id}/join`, data),
  leave: (id) => api.post(`/groups/${id}/leave`),
  createPost: (id, data) => api.post(`/groups/${id}/posts`, data),
  getInviteCode: (id) => api.get(`/groups/${id}/invite-code`),
  // Invite system
  sendInvite: (groupId, email) =>
    api.post(`/groups/${groupId}/invite`, { email }),
  getMyInvites: () => api.get("/groups/invites"),
  acceptInvite: (groupId) => api.post(`/groups/invites/${groupId}/accept`),
  rejectInvite: (groupId) => api.post(`/groups/invites/${groupId}/reject`),
  // Reply system
  replyToPost: (groupId, postId, content) =>
    api.post(`/groups/${groupId}/posts/${postId}/reply`, { content }),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getReviews: () => api.get("/admin/reviews"),
  getUsers: () => api.get("/admin/users"),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getItineraries: () => api.get("/admin/itineraries"),
};

export default api;
