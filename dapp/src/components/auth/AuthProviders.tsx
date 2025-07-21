"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// Tipe data untuk pengguna yang sudah login
interface UserSession {
  address: string;
  roles: string[];
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider utama
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan loading

  useEffect(() => {
    // Fungsi untuk memeriksa sesi dari server
    const validateSession = async () => {
      try {
        const res = await fetch("/api/user/session");
        if (!res.ok) throw new Error("No valid session");
        const userData: UserSession = await res.json();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook kustom untuk menggunakan context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Komponen RouteGuard
export function RouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jangan lakukan apa-apa jika masih loading
    if (isLoading) return;

    // Jika tidak terotentikasi dan berada di halaman dashboard, redirect ke home
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Tampilkan loading screen jika sesi masih diperiksa
  if (isLoading) {
    return <div>Loading Application...</div>; // Ganti dengan spinner yang lebih baik
  }

  // Jika sudah tidak loading dan tidak diizinkan di halaman ini, jangan render apa-apa
  // karena redirect sedang berlangsung.
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return null;
  }

  return <>{children}</>;
}
