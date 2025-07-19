"use client";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";

const MSG = "Nexaverse login – sign this message to continue";

export function useWalletSignin(onSuccess: () => void) {
  const { isConnected, address } = useAccount();      // ✅ boolean
  const { signMessageAsync }   = useSignMessage();
  const [signed, setSigned]    = useState(false);

  // sekali saja per session
  useEffect(() => {
    if (isConnected && !signed) {
      (async () => {
        try {
          await signMessageAsync({ message: MSG });
          setSigned(true);
          onSuccess();               // ← redirect
          localStorage.setItem("nexa_signed", "1"); // simpan sesi
        } catch {
          /* user cancel sign – stay */
        }
      })();
    }
  }, [isConnected, signed, signMessageAsync, onSuccess]);

  // persist setelah refresh
  useEffect(() => {
    if (isConnected && localStorage.getItem("nexa_signed") === "1") {
      setSigned(true);
      onSuccess();
    }
  }, [isConnected, onSuccess]);

  const clear = useCallback(() => {
    localStorage.removeItem("nexa_signed");
    setSigned(false);
  }, []);

  return { signed, address, clear } as const;
}
