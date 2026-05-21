import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, loading, logout } = useAuthStore();
  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  };
}
