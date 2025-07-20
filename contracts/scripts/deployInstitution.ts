// scripts/deploy.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
// Import konfigurasi terpusat kita
import config from "./deploy.config";

// Lokasi file output untuk menyimpan alamat kontrak yang telah di-deploy
const OUTPUT_FILE = path.resolve(__dirname, "../deploy.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log("🚀 DEPLOYING NEXAVERSE CONTRACTS 🚀");
  console.log("====================================================");
  console.log(`➡︎ Deployer Address: ${deployer.address}`);
  console.log(`➡︎ Network: ${network.name}`);
  console.log("----------------------------------------------------");

  // --- 1. DEPLOY ISBTREGISTRY ---
  console.log("⚙️  Deploying ISBTRegistry...");
  const RegistryFactory = await ethers.getContractFactory("ISBTRegistry");
  // Registry hanya memerlukan alamat owner awal saat deploy
  const registry = await RegistryFactory.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ ISBTRegistry deployed at: ${registryAddress}`);
  console.log("----------------------------------------------------");

  // --- 2. REGISTER INITIAL INSTITUTION ---
  // Mengambil data dari file konfigurasi, bukan hardcoded.
  const { name, website, email, type } = config.initialInstitution;
  
  console.log(`🏫 Registering initial institution: '${name}'...`);
  const registerTx = await registry.registerInstitution(
    deployer.address,
    name,
    website,
    email,
    type
  );
  await registerTx.wait();
  console.log("✅ Initial institution registered successfully!");
  console.log("----------------------------------------------------");

  // --- 3. DEPLOY INSTITUTIONSBT ---
  console.log("🎓 Deploying InstitutionSBT...");
  const SBTFactory = await ethers.getContractFactory("InstitutionSBT");
  
  // Menggunakan nama dan simbol dari file konfigurasi.
  const sbt = await SBTFactory.deploy(
    registryAddress,
    config.sbt.name,
    config.sbt.symbol,
    deployer.address
  );
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log(`✅ InstitutionSBT deployed at: ${sbtAddress}`);
  console.log("----------------------------------------------------");

  // --- 4. SAVE DEPLOYMENT ARTIFACTS ---
  console.log("📄 Saving deployment information...");
  const output = {
    network: network.name,
    ISBTRegistry: registryAddress,
    InstitutionSBT: sbtAddress,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ Deployment artifacts saved to: ${OUTPUT_FILE}`);
  console.log("====================================================");
  console.log("🎉 DEPLOYMENT COMPLETE 🎉");
  console.log("====================================================");
}

main().catch((err) => {
  console.error("❌ DEPLOYMENT FAILED:", err);
  process.exit(1);
});
