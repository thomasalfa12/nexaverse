// src/lib/useSocialWallet.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { Web3Auth, type Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, type SafeEventEmitterProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { BrowserProvider, type Eip1193Provider } from "ethers";

/* === ENV === */
const CLIENT_ID  = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;
const RPC_TARGET = process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA!;
const CHAIN_ID   = "0x14A34";        // base‑sepolia

export function useSocialWallet() {
  const [address,  setAddress]  = useState<string>();
  const [web3auth, setWeb3auth] = useState<Web3Auth>();
  const [ready,    setReady]    = useState(false);
  const [loading,  setLoading]  = useState(false);

  /* -------- initialise once, after window 'load' -------- */
  useEffect(() => {
    const start = async () => {
      const opts: Web3AuthOptions = {
        clientId: CLIENT_ID,
        web3AuthNetwork: "testnet",     // ← ubah ke "mainnet" ketika production
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: CHAIN_ID,
          rpcTarget: RPC_TARGET,
        },
      };

      const instance = new Web3Auth(opts);
      instance.configureAdapter(new OpenloginAdapter());
      await instance.initModal();
      setWeb3auth(instance);

      /* ---------- AUTO‑RECONNECT tanpa eth_requestAccounts ---------- */
      if (instance.provider) {
        try {
          const accounts = (await instance.provider.request({
            method: "eth_accounts",
            params: [],
          })) as string[];

          if (accounts?.length) {
            const addr = accounts[0];
            setAddress(addr);
            await fetch("/api/social/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: addr }),
              credentials: "include",
            });
          }
        } catch {
          /* silent – RPC publik bisa saja menolak eth_accounts */
        }
      }
      setReady(true);
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    }
  }, []);

  /* -------------------------- LOGIN POPUP -------------------------- */
  const login = useCallback(async () => {
    if (!web3auth) return;
    setLoading(true);
    try {
      const provider: SafeEventEmitterProvider | null = await web3auth.connect();
      if (!provider) return;

      const ethersProv = new BrowserProvider(provider as Eip1193Provider);
      const signer     = await ethersProv.getSigner();
      const addr       = await signer.getAddress();
      setAddress(addr);

      await fetch("/api/social/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
        credentials: "include",
      });
    } finally {
      setLoading(false);
    }
  }, [web3auth]);

  /* ---------------------------- LOGOUT ---------------------------- */
  const logout = useCallback(async () => {
    if (web3auth) await web3auth.logout();
    setAddress(undefined);
    await fetch("/api/siwe/logout", { method: "POST", credentials: "include" });
  }, [web3auth]);

  return {
    ready,
    loading,
    address,
    isLoggedIn: Boolean(address),
    login,
    logout,
  } as const;
}
