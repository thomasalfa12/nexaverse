// scripts/deployNexaCourse.ts

import { ethers } from "hardhat";

async function main() {
  console.log("Memulai proses deployment...");

  // Ambil signer yang akan men-deploy
  const [deployer] = await ethers.getSigners();
  console.log("Mendeploy kontrak dengan akun:", deployer.address);

  // --- Konfigurasi Awal ---
  // Ganti alamat ini dengan alamat Treasury Multi-sig Anda yang sebenarnya
  const treasuryAddress = "0xe6daf8c43e14B4Fd0Bb1Be5fB5319ddeC879E89e"; 
  // Fee dalam basis points (contoh: 300 = 3%)
  const treasuryFee = 300; 

  // FIX: Mengubah pengecekan menjadi validasi alamat Ethereum yang benar.
  // Ini lebih aman dan fleksibel daripada membandingkan string placeholder.
  if (!ethers.isAddress(treasuryAddress) || treasuryAddress === ethers.ZeroAddress) {
    console.error(`\n!!! PENTING: Alamat treasury "${treasuryAddress}" tidak valid. Harap ganti dengan alamat yang benar di dalam skrip deploy. !!!\n`);
    return;
  }

  // --- Langkah 1: Deploy Kontrak Logika (Implementation) ---
  console.log("\nLangkah 1: Mendeploy kontrak logika 'NexaCourse'...");
  const NexaCourse = await ethers.getContractFactory("NexaCourse");
  const nexaCourseImplementation = await NexaCourse.deploy();
  await nexaCourseImplementation.waitForDeployment();
  const implementationAddress = await nexaCourseImplementation.getAddress();
  
  console.log(`✅ Kontrak logika 'NexaCourse' berhasil di-deploy di alamat: ${implementationAddress}`);

  // --- Langkah 2: Deploy Kontrak Pabrik (Factory) ---
  console.log("\nLangkah 2: Mendeploy kontrak 'NexaCourseFactory'...");
  const NexaCourseFactory = await ethers.getContractFactory("NexaCourseFactory");
  const nexaCourseFactory = await NexaCourseFactory.deploy(
    deployer.address,       // Initial owner dari factory (bisa diganti ke treasury nanti)
    implementationAddress,  // Alamat kontrak logika dari Langkah 1
    treasuryAddress,        // Alamat treasury Anda
    treasuryFee             // Biaya treasury awal
  );
  await nexaCourseFactory.waitForDeployment();
  const factoryAddress = await nexaCourseFactory.getAddress();

  console.log(`✅ Kontrak 'NexaCourseFactory' berhasil di-deploy di alamat: ${factoryAddress}`);

  console.log("\n--- Deployment Selesai! ---");
  console.log("PENTING: Simpan alamat berikut di file .env.local Anda:");
  console.log(`NEXT_PUBLIC_NEXA_COURSE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("---------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
