import { ethers, network } from "hardhat";
import fs from "fs";

// Nama file output untuk menyimpan alamat kontrak
const OUTPUT_FILE = "./deploy.json";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`➡︎ Deployer Address: ${deployer.address}`);
  console.log(`➡︎ Deploying to network: ${network.name}`);
  console.log("----------------------------------------------------");

  // 1. Deploy ISBTRegistry
  // Kita deploy kontrak registry asli dan menjadikan 'deployer' sebagai pemilik (owner) awal.
  console.log("⚙️ Deploying ISBTRegistry...");
  const registry = await ethers.deployContract("ISBTRegistry", [deployer.address]);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ ISBTRegistry deployed to: ${registryAddress}`);

  // 2. Mendaftarkan institusi deployer ke dalam registry
  // Karena deployer adalah owner, ia bisa langsung mendaftarkan institusinya sendiri.
  // Siapkan data institusi untuk pendaftaran.
  const institutionName = "Universitas Nexa (Demo)";
  const institutionWebsite = "https://nexa.edu";
  const institutionEmail = "admin@nexa.edu";
  const institutionType = 1; // 1 = UNIVERSITAS, sesuai enum di ISBTRegistry.sol

  console.log(`\n⚙️ Registering '${institutionName}' for address ${deployer.address}...`);
  const tx = await registry.registerInstitution(
    deployer.address,
    institutionName,
    institutionWebsite,
    institutionEmail,
    institutionType
  );
  await tx.wait(); // Tunggu hingga transaksi pendaftaran selesai
  console.log("✅ Institution registered successfully!");

  // 3. Deploy InstitutionSBT
  // Kontrak SBT ini menggunakan alamat registry asli yang baru saja kita deploy.
  // Pemilik awal kontrak SBT ini adalah deployer, yang sudah kita daftarkan di registry.
  console.log("\n⚙️ Deploying InstitutionSBT...");
  const sbt = await ethers.deployContract("InstitutionSBT", [
    registryAddress,
    "Nexa Degree – Demo",
    "DEMO-ISBT",
    deployer.address,
  ]);
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log(`✅ InstitutionSBT deployed to: ${sbtAddress}`);

  // 4. Simpan alamat ke file JSON
  console.log("----------------------------------------------------");
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ 
      ISBTRegistry: registryAddress, 
      InstitutionSBT: sbtAddress 
    }, null, 2)
  );
  console.log(`📄 Deployment addresses saved to: ${OUTPUT_FILE}`);
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});