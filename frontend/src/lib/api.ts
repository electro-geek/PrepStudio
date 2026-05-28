import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the backend JWT on every request.
// getBackendToken() returns the cached token immediately when valid, and only
// hits Firebase + the /auth/token exchange when the token is missing or about
// to expire — which is at most once every 24 hours instead of once per request.
api.interceptors.request.use(async (config) => {
  try {
    // Lazy-import to avoid a circular dependency (authStore imports api indirectly)
    const { useAuthStore } = await import("../store/authStore");
    const token = await useAuthStore.getState().getBackendToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Failed to attach auth token:", e);
  }
  return config;
});

export default api;
