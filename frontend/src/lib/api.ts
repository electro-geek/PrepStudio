import axios from "axios";
import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-inject Firebase/Mock authentication token on every API call
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        // getIdToken is async and works on both real Firebase user and mock auth user
        const token = await user.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Failed to inject auth token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
