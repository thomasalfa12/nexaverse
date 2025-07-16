"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { checkRegistryOnChain } from './checkRegistryOnChain';

export function useIsInstitutionStatus() {
  const { address } = useAccount();
  const [isInstitution, setIsInstitution] = useState<boolean | null>(null);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const res = await checkRegistryOnChain(address);
        setIsInstitution(res);
      } catch {
        setIsInstitution(false);
      }
    })();
  }, [address]);

  return isInstitution;
}