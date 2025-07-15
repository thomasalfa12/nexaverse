import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";      // chai-matchers, ethers, waffle
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";
dotenv.config();

const { PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, CMC_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    hardhat: {},                       // in‑memory
    localhost: { url: "http://127.0.0.1:8545" },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },

  etherscan: {
    // Base Sepolia verification (uses basescan.io)
    apiKey: ETHERSCAN_API_KEY || undefined,
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },

  gasReporter: {
    enabled: !!CMC_KEY,
    currency: "USD",
    coinmarketcap: CMC_KEY,
    token: "ETH",
    showMethodSig: true,
  },

  paths: {
    artifacts: "../dapp/public/artifacts", // supaya Next.js ambil ABI otomatis
    cache: "./cache",
    sources: "./src",
    tests: "./test",
  },
};

export default config;
