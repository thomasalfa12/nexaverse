import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Mohon definisikan JWT_SECRET di .env.local");
}

// Tipe data yang kita harapkan ada di dalam JWT
export interface UserPayload extends JwtPayload {
  address: `0x${string}`;
  roles: string[];
}

/**
 * Fungsi ini berjalan di server untuk memverifikasi sesi JWT dari cookie
 * dan mengembalikan data pengguna yang terotentikasi.
 */
export async function getAuth() {
  // FIX: Di Next.js 15+, `cookies()` adalah async dan harus di-await
  const cookieStore = await cookies();
  const token = cookieStore.get("nexa_session")?.value;

  if (!token) {
    return { user: null };
  }

  try {
    // Kita sudah melakukan pengecekan JWT_SECRET di atas, jadi aman untuk menggunakan !
    const decoded = jwt.verify(token, JWT_SECRET!);

    if (typeof decoded === "object" && decoded !== null && 'address' in decoded && 'roles' in decoded) {
      return { user: decoded as UserPayload };
    }
    
    return { user: null };

  } catch (error) {
    console.error("Invalid JWT:", error);
    return { user: null };
  }
}