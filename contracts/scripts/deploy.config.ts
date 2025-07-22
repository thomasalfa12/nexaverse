// scripts/deploy.config.ts

/**
 * @notice File konfigurasi terpusat untuk skrip deployment inti.
 * REFACTOR: Nama variabel diubah agar lebih generik dan sesuai dengan visi.
 */
const config = {
  // Konfigurasi untuk kontrak VerifiedEntitySBT
  verifiedEntitySbt: {
    name: "Nexaverse Verified Entity",
    symbol: "NEXVE", // Simbol diubah agar lebih jelas
  },

  // Konfigurasi untuk entitas awal yang akan didaftarkan
  initialEntity: {
    name: "Nexaverse Foundation",
    primaryUrl: "https://nexaverse.xyz",
    email: "foundation@nexaverse.xyz",
    // Sesuai enum EntityType di ISBTRegistry.sol:
    // 1: INSTITUTION, 2: CREATOR, 3: COMMUNITY, 4: DAO
    type: 4, 
  },
};

export default config;
