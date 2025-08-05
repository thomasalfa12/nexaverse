import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
// Inisialisasi NextAuth dengan konfigurasi dasar dan ekspor fungsi `auth`
export default NextAuth(authConfig).auth;
 
export const config = {
  // Lindungi semua rute KECUALI API, file statis, dan gambar
  // Ini adalah matcher yang lebih tangguh dan direkomendasikan.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
