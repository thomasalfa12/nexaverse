"use client";

import { useState, useEffect, useCallback } from "react";
import { Web3Auth, type Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, type SafeEventEmitterProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { BrowserProvider, type Eip1193Provider } from "ethers";
import { toast } from "sonner";

/* === ENV & KONFIGURASI === */
const CLIENT_ID  = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;
const RPC_TARGET = process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA!;
const CHAIN_ID   = "0x14A34"; // base-sepolia

export function useSocialWallet() {
  const [address,  setAddress]  = useState<string>();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [ready,    setReady]    = useState(false);
  const [loading,  setLoading]  = useState(false);

  /* -------- Inisialisasi Web3Auth dengan Penanganan Error -------- */
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Memulai inisialisasi Web3Auth...");
        if (!CLIENT_ID) {
          throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID tidak ditemukan di .env.local");
        }

        const opts: Web3AuthOptions = {
          clientId: CLIENT_ID,
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: CHAIN_ID,
            rpcTarget: RPC_TARGET,
            displayName: "Base Sepolia Testnet",
            blockExplorer: "https://sepolia.basescan.org/",
            ticker: "ETH",
            tickerName: "Sepolia Ether",
          },
          uiConfig: {
            loginMethodsOrder: ["google", "facebook", "twitter"],
          },
        };

        const instance = new Web3Auth(opts);
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: "popup",
          },
        });
        instance.configureAdapter(openloginAdapter);
        
        await instance.initModal();
        setWeb3auth(instance);
        console.log("Web3Auth berhasil diinisialisasi.");

        // FIX: Menggunakan metode `eth_accounts` yang pasif untuk auto-reconnect.
        // Ini tidak akan memicu pop-up dan tidak akan mengirim `eth_requestAccounts` ke RPC.
        if (instance.provider) {
          console.log("Mencoba auto-reconnect...");
          const accounts = (await instance.provider.request({
            method: "eth_accounts",
          })) as string[];

          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            console.log("Berhasil auto-reconnect ke alamat:", accounts[0]);
          } else {
            console.log("Tidak ada sesi aktif untuk auto-reconnect.");
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
        console.error("Gagal menginisialisasi Web3Auth:", errorMessage);
        console.error("Detail Error:", error);
        toast.error("Gagal memuat layanan login sosial. Periksa konsol untuk detail.");
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  /* -------------------------- LOGIN POPUP -------------------------- */
  const login = useCallback(async () => {
    if (!web3auth) {
      toast.error("Layanan login belum siap.");
      return;
    }
    setLoading(true);
    try {
      const provider: SafeEventEmitterProvider | null = await web3auth.connect();
      if (!provider) return;

      const ethersProv = new BrowserProvider(provider as Eip1193Provider);
      const signer     = await ethersProv.getSigner();
      const addr       = await signer.getAddress();
      setAddress(addr);

      await fetch("/api/user/login/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      
    } catch (error) {
        console.error("Gagal login sosial:", error);
        toast.error("Gagal melakukan login.");
    } finally {
      setLoading(false);
    }
  }, [web3auth]);

  /* ---------------------------- LOGOUT ---------------------------- */
  const logout = useCallback(async () => {
    if (web3auth) {
      await web3auth.logout();
    }
    setAddress(undefined);
    await fetch("/api/user/logout", { method: "POST" });
  }, [web3auth]);

  return {
    ready,
    loading,
    address,
    isLoggedIn: !!address,
    login,
    logout,
  } as const;
}