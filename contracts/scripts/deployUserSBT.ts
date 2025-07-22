// scripts/deployUserSBT.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import userSbtConfig from "./deployUserSBT.config";

const CORE_DEPLOYMENTS_FILE = path.resolve(__dirname, "../deployments.json");
const USER_SBT_OUTPUT_FILE = path.resolve(__dirname, "../userSbtDeployments.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("====================================================");
  console.log("🚀 DEPLOYING NEW UserSBT CONTRACT 🚀");
  console.log("====================================================");
  console.log(`➡︎ Deployer Address: ${deployer.address}`);
  console.log(`➡︎ Network: ${network.name}`);
  console.log("----------------------------------------------------");

  // --- 1. LOAD CORE DEPLOYMENT ADDRESSES ---
  if (!fs.existsSync(CORE_DEPLOYMENTS_FILE)) {
    throw new Error("Core deployments file not found! Please run deployCore.ts first.");
  }
  const coreDeployments = JSON.parse(fs.readFileSync(CORE_DEPLOYMENTS_FILE, "utf-8"));
  const registryAddress = coreDeployments.ISBTRegistry;
  if (!registryAddress) {
    throw new Error("ISBTRegistry address not found in deployments.json");
  }
  console.log(`🔗 Using ISBTRegistry at: ${registryAddress}`);
  console.log("----------------------------------------------------");

  // --- 2. DEPLOY UserSBT ---
  console.log(`✨ Deploying UserSBT: "${userSbtConfig.name}"...`);
  const UserSBTFactory = await ethers.getContractFactory("UserSBT");

  // Tentukan owner. Jika config adalah "DEPLOYER", gunakan alamat deployer.
  const ownerAddress = userSbtConfig.owner === "DEPLOYER" ? deployer.address : userSbtConfig.owner;

  const userSbt = await UserSBTFactory.deploy(
    registryAddress,
    userSbtConfig.name,
    userSbtConfig.symbol,
    ownerAddress
  );
  await userSbt.waitForDeployment();
  const userSbtAddress = await userSbt.getAddress();
  console.log(`✅ UserSBT "${userSbtConfig.name}" deployed at: ${userSbtAddress}`);
  console.log("----------------------------------------------------");

  // --- 3. SAVE/APPEND DEPLOYMENT INFO ---
  console.log("📄 Saving UserSBT deployment information...");
  let allUserSbtDeployments = [];
  if (fs.existsSync(USER_SBT_OUTPUT_FILE)) {
    allUserSbtDeployments = JSON.parse(fs.readFileSync(USER_SBT_OUTPUT_FILE, "utf-8"));
  }

  const newDeployment = {
    name: userSbtConfig.name,
    symbol: userSbtConfig.symbol,
    address: userSbtAddress,
    owner: ownerAddress,
    network: network.name,
    deployedAt: new Date().toISOString(),
  };

  allUserSbtDeployments.push(newDeployment);

  fs.writeFileSync(USER_SBT_OUTPUT_FILE, JSON.stringify(allUserSbtDeployments, null, 2));
  console.log(`✅ UserSBT deployment saved to: ${USER_SBT_OUTPUT_FILE}`);
  console.log("====================================================");
}

main().catch((err) => {
  console.error("❌ UserSBT DEPLOYMENT FAILED:", err);
  process.exit(1);
});
