// File: components/auth/AuthWatcher.tsx
// Tujuan: Komponen ini secara global mendengarkan perubahan akun di wallet pengguna.
//         Jika akun berubah, ia akan secara paksa me-logout sesi di server,
//         kemudian me-reload halaman untuk memastikan state aplikasi bersih.
"use client";

import { useEffect } from "react";

const AuthWatcher = () => {
  useEffect(() => {
    const provider = window.ethereum;
    if (typeof window === "undefined" || !provider) {
      console.log(
        "AuthWatcher: Bukan lingkungan browser atau tidak ada wallet provider."
      );
      return;
    }

    /**
     * Handler yang akan dieksekusi ketika event 'accountsChanged' terdeteksi.
     * Fungsi ini sekarang menjadi async untuk menangani proses logout.
     * @param accounts Array string alamat wallet yang baru.
     */
    const handleAccountsChanged = async (accounts: string[]) => {
      console.log(
        "AuthWatcher: Akun wallet berubah! Memulai proses logout paksa.",
        accounts
      );

      try {
        // Panggil API untuk menghancurkan sesi di server.
        const response = await fetch("/api/user/logout", { method: "POST" });

        if (!response.ok) {
          console.error("AuthWatcher: Gagal menghancurkan sesi di server.");
        } else {
          console.log("AuthWatcher: Sesi di server berhasil dihancurkan.");
        }
      } catch (error) {
        console.error(
          "AuthWatcher: Terjadi error saat menghubungi API logout.",
          error
        );
      } finally {
        // SELALU reload halaman setelah mencoba logout, baik berhasil maupun gagal,
        // untuk memastikan state frontend di-reset.
        console.log(
          "AuthWatcher: Memuat ulang aplikasi untuk menyelesaikan proses."
        );
        window.location.reload();
      }
    };

    // Mulai mendengarkan event 'accountsChanged' dari provider wallet
    provider.on("accountsChanged", handleAccountsChanged);

    // Fungsi cleanup
    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        console.log(
          "AuthWatcher: Listener untuk accountsChanged telah dihapus."
        );
      }
    };
  }, []);

  return null;
};

export default AuthWatcher;
