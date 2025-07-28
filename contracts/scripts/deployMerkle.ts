import { ethers } from "hardhat";
import "dotenv/config"; // Pastikan untuk menginstal dotenv: npm install dotenv

async function main() {
  console.log("Menyiapkan deployment MerkleClaimSBTFactory...");

  // 1. Dapatkan deployer (akun yang akan membayar gas)
  const [deployer] = await ethers.getSigners();
  console.log("Mendeploy kontrak dengan akun:", deployer.address);

  // 2. Dapatkan alamat Registry dari environment variable
  // Alamat ini adalah alamat ISBTRegistry yang sudah ada dan ter-deploy.
  const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  if (!registryAddress) {
    throw new Error(
      "Error: NEXT_PUBLIC_REGISTRY_ADDRESS tidak ditemukan di file .env. Harap pastikan variabel ini ada."
    );
  }
  console.log("Menggunakan alamat Registry:", registryAddress);

  // 3. Tetapkan pemilik dari Factory ini. Biasanya sama dengan deployer.
  const owner = deployer.address;

  // 4. Deploy MerkleClaimSBTFactory dengan DUA argumen yang benar
  console.log("Mendeploy MerkleClaimSBTFactory...");
  const Factory = await ethers.getContractFactory("MerkleClaimSBTFactory");
  
  // PERUBAHAN KUNCI: Kirim `registryAddress` dan `owner` ke constructor.
  const factory = await Factory.deploy(registryAddress, owner);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("✅ MerkleClaimSBTFactory berhasil di-deploy di alamat:", factoryAddress);
  console.log("\n--- TINDAKAN WAJIB ---");
  console.log("Salin variabel lingkungan berikut ke file .env.local Anda:");
  console.log("----------------------------------------------------");
  console.log(`NEXT_PUBLIC_MERKLE_SBT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});