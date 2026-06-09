import { create } from "zustand";
import { auth, logOut as firebaseLogOut } from "../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "prepstudio_access_token";
const TOKEN_EXPIRY_KEY = "prepstudio_token_expiry";

interface AuthState {
  user: any | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: any | null) => void;
  logout: () => Promise<void>;
  // Exposed so api.ts can read/refresh the token without importing authStore circularly
  getBackendToken: () => Promise<string | null>;
}

async function exchangeForBackendToken(firebaseToken: string): Promise<{ token: string; expiry: number } | null> {
  try {
    const res = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firebaseToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const expiry = Date.now() + data.expires_in * 1000;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
    }
    return { token: data.access_token, expiry };
  } catch {
    return null;
  }
}

// Force a fresh Firebase token + backend exchange. Used right after signup,
// once the displayName is set, so the backend persists the user's real name.
export async function forceTokenRefresh(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const firebaseToken = await user.getIdToken(true);
    await exchangeForBackendToken(firebaseToken);
  } catch {
    /* best-effort — onAuthStateChanged already did an initial exchange */
  }
}

function clearStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

function getStoredToken(): { token: string; expiry: number } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || "0");
  if (!token || !expiry) return null;
  return { token, expiry };
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
      clearStoredToken();
      set({ user: null, loading: false });
    } catch (e) {
      console.error("Sign out failed:", e);
      set({ loading: false });
    }
  },

  getBackendToken: async (): Promise<string | null> => {
    const stored = getStoredToken();
    // Return stored token if it has > 2 minutes of life left
    if (stored && stored.expiry > Date.now() + 120_000) {
      return stored.token;
    }

    // Token missing or near expiry — re-exchange using current Firebase user
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const firebaseToken = await user.getIdToken(stored !== null);
      const result = await exchangeForBackendToken(firebaseToken);
      return result?.token ?? null;
    } catch {
      return null;
    }
  },
}));

// ── Bootstrap: sync Firebase auth state and exchange token on login ──────────
if (typeof window !== "undefined") {
  auth.onAuthStateChanged(async (user: any) => {
    if (user) {
      // Exchange Firebase token once on login so all subsequent API calls use
      // our own JWT and never touch Firebase verification again.
      try {
        const firebaseToken = await user.getIdToken();
        await exchangeForBackendToken(firebaseToken);
      } catch (e) {
        console.error("[PrepStudio] Token exchange failed:", e);
      }
    } else {
      clearStoredToken();
    }
    useAuthStore.getState().setUser(user);
  });
}
