"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Impor spinner untuk tampilan loading yang lebih baik

// Tipe data untuk pengguna yang sudah login
interface UserSession {
  address: string;
  roles: string[];
  entityId?: number; // Pastikan entityId ada di sini
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch("/api/user/session"); // Asumsi endpoint ini ada
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

// Komponen RouteGuard yang sudah diperbaiki
export function RouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // PERBAIKAN KUNCI: Jika tidak terotentikasi dan mencoba mengakses
    // area dashboard, arahkan ke halaman `/login`.
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Tampilkan loading screen yang lebih baik saat sesi diperiksa
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika redirect sedang berlangsung, jangan render apa-apa
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return null;
  }

  return <>{children}</>;
}
