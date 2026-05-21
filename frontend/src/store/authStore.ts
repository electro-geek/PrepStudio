import { create } from "zustand";
import { auth, logOut as firebaseLogOut } from "../lib/firebase";

interface AuthState {
  user: any | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: any | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setLoading: (loading) => set({ loading }),
  setUser: (user) => set({ user, loading: false }),
  logout: async () => {
    set({ loading: true });
    try {
      await firebaseLogOut();
      set({ user: null, loading: false });
    } catch (e) {
      console.error("Sign out failed:", e);
      set({ loading: false });
    }
  },
}));

// Initialize listener to sync with Firebase Auth / Mock state
if (typeof window !== "undefined") {
  auth.onAuthStateChanged((user: any) => {
    useAuthStore.getState().setUser(user);
  });
}
