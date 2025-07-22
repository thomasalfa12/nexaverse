// scripts/deployCore.ts (Nama file diubah agar lebih jelas)

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import deployConfig from "./deploy.config";

const OUTPUT_FILE = path.resolve(__dirname, "../deployments.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log("🚀 DEPLOYING NEXAVERSE CORE CONTRACTS 🚀");
  console.log("====================================================");
  console.log(`➡︎ Deployer Address: ${deployer.address}`);
  console.log(`➡︎ Network: ${network.name}`);
  console.log("----------------------------------------------------");

  // --- 1. DEPLOY ISBTREGISTRY ---
  console.log("⚙️  Deploying ISBTRegistry...");
  const RegistryFactory = await ethers.getContractFactory("ISBTRegistry");
  const registry = await RegistryFactory.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ ISBTRegistry deployed at: ${registryAddress}`);
  console.log("----------------------------------------------------");

  // --- 2. REGISTER INITIAL ENTITY ---
  const { name, primaryUrl, email, type } = deployConfig.initialEntity;
  
  console.log(`🏫 Registering initial entity: '${name}'...`);
  // FIX: Memanggil fungsi `registerEntity` yang baru, bukan `registerInstitution`
  const registerTx = await registry.registerEntity(
    deployer.address,
    name,
    primaryUrl,
    email,
    type
  );
  await registerTx.wait();
  console.log("✅ Initial entity registered successfully!");
  console.log("----------------------------------------------------");

  // --- 3. DEPLOY VERIFIEDENTITYSBT ---
  console.log("🎓 Deploying VerifiedEntitySBT...");
  // REFACTOR: Menggunakan nama kontrak yang baru
  const SBTFactory = await ethers.getContractFactory("VerifiedEntitySBT");
  
  const sbt = await SBTFactory.deploy(
    registryAddress,
    deployConfig.verifiedEntitySbt.name,
    deployConfig.verifiedEntitySbt.symbol,
    deployer.address
  );
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log(`✅ VerifiedEntitySBT deployed at: ${sbtAddress}`);
  console.log("----------------------------------------------------");

  // --- 4. SAVE DEPLOYMENT ARTIFACTS ---
  console.log("📄 Saving deployment information...");
  const output = {
    network: network.name,
    ISBTRegistry: registryAddress,
    VerifiedEntitySBT: sbtAddress, // REFACTOR: Key diubah
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ Core deployment saved to: ${OUTPUT_FILE}`);
  console.log("====================================================");
}

main().catch((err) => {
  console.error("❌ CORE DEPLOYMENT FAILED:", err);
  process.exit(1);
});
