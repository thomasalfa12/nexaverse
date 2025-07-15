import { ethers, network } from "hardhat";
import fs from "fs";

const OUT = "./deploy.json";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`➡︎ Deploy from ${deployer.address} to ${network.name}`);

  /* 1. Registry */
  const registry = await ethers.deployContract("MockRegistry");
  await registry.waitForDeployment();
  await registry.registerInstitution(deployer.address);
  console.log("✅ MockRegistry :", await registry.getAddress());

  /* 2. SBT */
  const sbt = await ethers.deployContract(
    "InstitutionSBT",
    [await registry.getAddress(), "Nexa Degree – Demo", "DEMO-ISBT", deployer.address],
  );
  await sbt.waitForDeployment();
  console.log("✅ InstitutionSBT:", await sbt.getAddress());

  fs.writeFileSync(
    OUT,
    JSON.stringify({ MockRegistry: await registry.getAddress(), InstitutionSBT: await sbt.getAddress() }, null, 2),
  );
  console.log("📄 Saved →", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });