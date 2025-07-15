import { ethers, network } from "hardhat";
import * as fs from "fs";

const FILE = "../deploy.json";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`➡︎ Deploying UserSBT from ${deployer.address} on ${network.name}`);

  /* 1. Ambil alamat Registry & InstitutionSBT hasil deploy pertama */
  const addresses   = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const registry    = addresses.MockRegistry;
  const institution = addresses.InstitutionSBT;

  /* 2. Deploy UserSBT */
  const name   = "Nexa Credential – Demo University";
  const symbol = "DEMO‑USBT";

  const userSbt = await ethers.deployContract(
    "UserSBT",
    [registry, name, symbol, deployer.address]
  );
  await userSbt.waitForDeployment();
  const userAddr = await userSbt.getAddress();
  console.log("✅ UserSBT       :", userAddr);

  /* 3. Update deploy.json */
  addresses.UserSBT = userAddr;
  fs.writeFileSync(FILE, JSON.stringify(addresses, null, 2));
  console.log("📄 Updated deploy.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
