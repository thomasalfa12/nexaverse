// scripts/deployUserSBT.config.ts

/**
 * @notice Konfigurasi untuk mendeploy satu instance dari kontrak UserSBT.
 * Ubah file ini setiap kali Anda ingin menerbitkan jenis kredensial baru.
 */
const userSbtConfig = {
  // Nama kredensial. Akan terlihat di OpenSea, dll.
  name: "Sertifikat Nexaverse",
  // Simbol untuk kredensial ini.
  symbol: "NEXA",
  // Alamat wallet yang akan menjadi owner dari kontrak UserSBT ini.
  // Biasanya adalah alamat wallet dari VerifiedEntity yang menerbitkannya.
  // Untuk pengujian, kita bisa gunakan alamat deployer.
  // Di produksi, ini akan menjadi alamat komunitas/kreator.
  owner: "DEPLOYER", // Gunakan "DEPLOYER" untuk otomatis menggunakan alamat deployer
};

export default userSbtConfig;
