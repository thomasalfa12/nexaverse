// src/types/sbt.ts
export type SBTRequest = {
  tokenId: string;
  to: string;
  uri: string;
  deadline: string;
};

export type SBTSignature = {
  tokenId: string;
  to: string;
  uri: string;
  deadline: string;
  signature: string;
};

