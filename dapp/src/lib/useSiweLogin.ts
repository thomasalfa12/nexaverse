"use client";
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function useSiweLogin() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const { nonce } = await fetch("/api/siwe").then((r) => r.json());
      const msg = `Nexaverse wants you to sign in.\n\nNonce: ${nonce}`;
      const sig = await signMessageAsync({ message: msg });
      const res = await fetch("/api/siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, signature: sig }),
      });
      if (!res.ok) throw new Error("verify failed");
      window.location.replace("/dashboard");
    } catch {
      /* user cancel / gagal */
    } finally {
      setLoading(false);
    }
  };

  return { login, loading } as const;
}
