"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink blueprint">
        <div className="panel px-8 py-7 flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="w-1.5 h-full bg-ink telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <p className="mono-label text-ink-500">[ AUTHENTICATING · SYNC ]</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
