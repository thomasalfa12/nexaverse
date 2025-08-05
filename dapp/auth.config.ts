import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Callback ini berjalan di middleware dan menjadi "penjaga gerbang" utama
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        // Jika pengguna mencoba mengakses dashboard, mereka HARUS sudah login
        if (isLoggedIn) return true;
        return false; // Jika tidak, redirect otomatis ke halaman login
      } else if (isLoggedIn) {
        // Jika pengguna SUDAH login dan mencoba mengakses halaman publik
        // seperti /login, arahkan mereka ke dashboard.
        if (nextUrl.pathname === '/login') {
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      
      // Izinkan akses untuk semua kasus lainnya (misalnya, halaman publik untuk pengguna anonim)
      return true;
    },
  },
  providers: [], // Provider didefinisikan di file auth.ts utama
} satisfies NextAuthConfig;
