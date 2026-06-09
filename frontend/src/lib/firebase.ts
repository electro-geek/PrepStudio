import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword as firebaseEmailSignIn,
  createUserWithEmailAndPassword as firebaseEmailSignUp,
  signInWithPopup as firebaseSignInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";

// ── Firebase config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isMock =
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("mock");

// ── Mock auth (zero-config local testing) ────────────────────────────────────
function createMockAuth() {
  let currentUser: any = null;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("learnforge_mock_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentUser = {
          ...parsed,
          getIdToken: async () => `${parsed.uid}:${parsed.email}`,
        };
      } catch {
        currentUser = null;
      }
    }
  }

  const listeners: Function[] = [];
  const notify = () => listeners.forEach((cb) => cb(currentUser));

  const persist = (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "learnforge_mock_user",
        JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName })
      );
    }
  };

  const makeUser = (uid: string, email: string, displayName: string) => ({
    uid,
    email,
    displayName,
    getIdToken: async () => `${uid}:${email}`,
  });

  return {
    isMock: true as const,
    get currentUser() {
      return currentUser;
    },
    onAuthStateChanged(callback: Function) {
      listeners.push(callback);
      callback(currentUser);
      return () => {
        const i = listeners.indexOf(callback);
        if (i > -1) listeners.splice(i, 1);
      };
    },
    async _signIn(email: string, name?: string) {
      const uid = "mock-user-" + email.replace(/[^a-zA-Z0-9]/g, "");
      const displayName = name || email.split("@")[0];
      currentUser = makeUser(uid, email, displayName);
      persist(currentUser);
      notify();
      return { user: currentUser };
    },
    async _signOut() {
      currentUser = null;
      if (typeof window !== "undefined") localStorage.removeItem("learnforge_mock_user");
      notify();
    },
  };
}

// ── Real Firebase init ────────────────────────────────────────────────────────
let realAuth: any = null;
let mockAuth: ReturnType<typeof createMockAuth> | null = null;

if (!isMock) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    realAuth = getAuth(app);
  } catch (e) {
    console.warn("[PrepStudio] Firebase init failed, falling back to mock auth:", e);
  }
}

if (isMock || !realAuth) {
  mockAuth = createMockAuth();
}

// The raw auth object (for onAuthStateChanged & currentUser access)
export const auth: any = realAuth ?? mockAuth;
export { isMock };
export const googleProvider = new GoogleAuthProvider();

// ── Unified wrapper functions (work with both real Firebase and mock) ──────────

export async function signIn(email: string, password: string) {
  if (mockAuth) {
    return mockAuth._signIn(email);
  }
  return firebaseEmailSignIn(realAuth, email, password);
}

export async function signUp(email: string, password: string, name?: string) {
  if (mockAuth) {
    return mockAuth._signIn(email, name); // mock: create = sign in
  }
  const cred = await firebaseEmailSignUp(realAuth, email, password);
  if (name) {
    // Set the Firebase displayName so the ID token carries a `name` claim,
    // then force-refresh the token so the claim is present for the backend.
    await updateProfile(cred.user, { displayName: name });
    await cred.user.getIdToken(true);
  }
  return cred;
}

export async function signInWithGoogle() {
  if (mockAuth) {
    return mockAuth._signIn("google.student@prepstudio.app");
  }
  return firebaseSignInWithPopup(realAuth, googleProvider);
}

export async function logOut() {
  if (mockAuth) {
    return mockAuth._signOut();
  }
  return firebaseSignOut(realAuth);
}
