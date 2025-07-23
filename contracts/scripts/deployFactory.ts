// File: scripts/deployFactory.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

// Path ke file yang menyimpan alamat kontrak inti yang sudah di-deploy
const CORE_DEPLOYMENTS_FILE = path.resolve(__dirname, "../deployments.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log("🚀 DEPLOYING UserSBTFactory CONTRACT 🚀");
  console.log("====================================================");
  console.log(`➡︎ Deployer (Server Wallet): ${deployer.address}`);
  console.log(`➡︎ Network: ${network.name}`);
  console.log("----------------------------------------------------");

  // --- 1. MUAT ALAMAT KONTRAK INTI ---
  if (!fs.existsSync(CORE_DEPLOYMENTS_FILE)) {
    throw new Error(
      `Core deployments file not found at ${CORE_DEPLOYMENTS_FILE}. Please run deployCore.ts first.`
    );
  }
  const coreDeployments = JSON.parse(fs.readFileSync(CORE_DEPLOYMENTS_FILE, "utf-8"));
  const registryAddress = coreDeployments.ISBTRegistry;

  if (!registryAddress) {
    throw new Error("ISBTRegistry address not found in deployments.json. Cannot proceed.");
  }
  console.log(`🔗 Using ISBTRegistry at: ${registryAddress}`);
  console.log("----------------------------------------------------");

  // --- 2. DEPLOY KONTRAK UserSBTFactory ---
  console.log("🏭 Deploying UserSBTFactory...");
  const Factory = await ethers.getContractFactory("UserSBTFactory");
  
  // Deploy Pabrik dengan dua argumen:
  // 1. Alamat Registry (untuk verifikasi)
  // 2. Alamat Owner awal (alamat deployer, yang akan menjadi wallet server Anda)
  const factory = await Factory.deploy(registryAddress, deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ UserSBTFactory deployed successfully at: ${factoryAddress}`);
  console.log("----------------------------------------------------");

  // --- 3. PERBARUI FILE DEPLOYMENT ---
  console.log("📄 Updating deployment artifacts...");
  
  // Tambahkan alamat Factory ke file JSON yang sudah ada
  coreDeployments.UserSBTFactory = factoryAddress;
  
  fs.writeFileSync(CORE_DEPLOYMENTS_FILE, JSON.stringify(coreDeployments, null, 2));
  
  console.log(`✅ Deployment artifacts updated with Factory address in: ${CORE_DEPLOYMENTS_FILE}`);
  console.log("====================================================");
  console.log("🎉 FACTORY DEPLOYMENT COMPLETE 🎉");
  console.log("====================================================");
}

main().catch((error) => {
  console.error("❌ FACTORY DEPLOYMENT FAILED:", error);
  process.exit(1);
});
