import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

const OUTPUT_FILE = path.resolve(__dirname, "../deploy.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`➡︎ Deployer Address: ${deployer.address}`);
  console.log(`➡︎ Deploying to network: ${network.name}`);
  console.log("----------------------------------------------------");

  // 1. Deploy ISBTRegistry
  console.log("⚙️ Deploying ISBTRegistry...");
  const RegistryFactory = await ethers.getContractFactory("ISBTRegistry");
  const registry = await RegistryFactory.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ ISBTRegistry deployed at: ${registryAddress}`);

  // 2. Register Deployer as an Institution
  const institutionName = "Universitas Nexa (Demo)";
  const institutionWebsite = "https://nexa.edu";
  const institutionEmail = "admin@nexa.edu";
  const institutionType = 1; // UNIVERSITAS

  console.log(`\n🏫 Registering institution '${institutionName}'...`);
  const registerTx = await registry.registerInstitution(
    deployer.address,
    institutionName,
    institutionWebsite,
    institutionEmail,
    institutionType
  );
  await registerTx.wait();
  console.log("✅ Institution registered!");

  // 3. Deploy InstitutionSBT
  console.log("\n🎓 Deploying InstitutionSBT...");
  const SBTFactory = await ethers.getContractFactory("InstitutionSBT");
  const sbt = await SBTFactory.deploy(
    registryAddress,
    "Nexa Degree – Demo",
    "DEMO-ISBT",
    deployer.address
  );
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log(`✅ InstitutionSBT deployed at: ${sbtAddress}`);

  // 4. Save addresses to deploy.json
  const output = {
    ISBTRegistry: registryAddress,
    InstitutionSBT: sbtAddress,
    network: network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log("----------------------------------------------------");
  console.log(`📄 Deployment saved to: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
