import { ethers } from "hardhat";

async function main() {
  console.log("Menyiapkan deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Mendeploy kontrak dengan akun:", deployer.address);

  const owner = deployer.address;

  // --- Langkah 1: Deploy NexaverseTreasury ---
  console.log("\n1. Mendeploy NexaverseTreasury...");
  const Treasury = await ethers.getContractFactory("src/access/Ownable.sol:NexaverseTreasury");
  
  // Parameter untuk constructor NexaverseTreasury Anda:
  // address[] memory _owners, uint256 _requiredConfirmations, uint256 _dailyLimit
  const owners = [owner];
  const requiredConfirmations = 1;
  const dailyLimit = ethers.parseEther("10");

  const treasury = await Treasury.deploy(owners, requiredConfirmations, dailyLimit);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ NexaverseTreasury berhasil di-deploy di alamat:", treasuryAddress);

  // --- Langkah 2: Deploy CourseFactory ---
  console.log("\n2. Mendeploy CourseFactory...");
  const CourseFactory = await ethers.getContractFactory("src/CourseFactory.sol:CourseFactory");

  // FIX UTAMA: Memanggil constructor CourseFactory dengan DUA argumen
  // yang benar sesuai dengan kode kontrak Anda:
  // constructor(address _treasury, address _owner)
  console.log("Parameter Constructor CourseFactory:", { treasuryAddress, owner });
  const courseFactory = await CourseFactory.deploy(treasuryAddress, owner);
  
  await courseFactory.waitForDeployment();
  const factoryAddress = await courseFactory.getAddress();
  console.log("✅ CourseFactory berhasil di-deploy di alamat:", factoryAddress);

  // --- Langkah Selanjutnya ---
  console.log("\n--- TINDAKAN WAJIB ---");
  console.log("Salin variabel lingkungan berikut ke file .env.local Anda:");
  console.log("----------------------------------------------------");
  console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`NEXT_PUBLIC_COURSE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("----------------------------------------------------");
  console.log("\nSetelah menyalin, restart server pengembangan Anda untuk menerapkan perubahan.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});