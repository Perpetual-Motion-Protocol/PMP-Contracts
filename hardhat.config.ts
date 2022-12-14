/* eslint-disable camelcase */
import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "@typechain/hardhat";
import "hardhat-tracer";
import "solidity-coverage";
import "hardhat-abi-exporter";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  abiExporter: {
    path: "./data/abi",
    runOnCompile: true,
    clear: true,
    flat: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    pledger1: {
      default: 1,
      mainnet: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.PLEDGER1_PRIVATE_KEY}`,
    },
    pledger2: {
      default: 2,
      mainnet: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.PLEDGER2_PRIVATE_KEY}`,
    },
    pledger3: {
      default: 3,
      mainnet: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.PLEDGER3_PRIVATE_KEY}`,
    },
    fundingAddress1: {
      default: 4,
      mainnet: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.FUNDINGADDRESS1_PRIVATE_KEY}`,
    },
    fundingAddress2: {
      default: 5,
      mainnet: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.FUNDINGADDRESS2_PRIVATE_KEY}`,
    },
    fundingAddress3: {
      default: 6,
      mainnet: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      rinkeby: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      polygon_mainnet: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      polygon_mumbai: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      optimism_mainnet: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      optimism_goerli: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
      scroll_testnet: `privatekey://${process.env.FUNDINGADDRESS3_PRIVATE_KEY}`,
    },
  },
  networks: {
    mumbai: {
      chainId: 80001,
      url: process.env.POLYGON_MUMBAI_PROVIDER,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    polygon: {
      chainId: 137,
      url: process.env.POLYGON_MAINNET_PROVIDER,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    optimism: {
      chainId: 10,
      url: process.env.OPTIMISM_MAINNET_PROVIDER,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    optimismgoerli: {
      chainId: 420,
      url: process.env.OPTIMISM_GOERLI_PROVIDER,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    scroll: { // l2 
      chainId: 534354,
      url: process.env.SCROLL_TESTNET_PROVIDER,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    hardhat: {
      forking: {
        url: process.env.POLYGON_MUMBAI_PROVIDER ? process.env.POLYGON_MUMBAI_PROVIDER : "",
        blockNumber: 28516994,  // Polygon Mumbai
        // blockNumber: 34100359, // Polygon Mainnet.
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    deploy: "deploy/core",
  },
};

export default config;
