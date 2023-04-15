require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-abi-exporter");

module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [process.env.MATIC_PRIVATE_KEY],
    },
  },
  abiExporter: {
    path: "./frontend/visualizer/src",
    runOnCompile: true,
  },
};
