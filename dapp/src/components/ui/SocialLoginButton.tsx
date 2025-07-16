"use client";
import { useSocialWallet } from "@/lib/useSocialWallet";
import { useRouter } from "next/navigation";

export default function SocialLoginButton() {
  const { ready, address, login, logout } = useSocialWallet();
  const router = useRouter();

  /* ➜ redirect begitu social login sukses */
  if (ready && address) {
    // gunakan replace agar history bersih
    router.replace("/dashboard");
  }

  if (!ready) return null; // sembunyikan selama inisialisasi

  return address ? (
    <button
      onClick={logout}
      className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white shadow hover:bg-red-700"
    >
      Logout {`${address.slice(0, 6)}…${address.slice(-4)}`}
    </button>
  ) : (
    <button
      onClick={login}
      className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
    >
      Continue with Google
    </button>
  );
}
