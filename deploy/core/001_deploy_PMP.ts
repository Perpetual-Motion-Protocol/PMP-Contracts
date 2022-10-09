import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployNonUpgradeable } from "../helpers/deployNonUpgradeable";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const signers = await ethers.getSigners();
  await deployNonUpgradeable(hre, "PerpetualMotionProtocol", []);
  await deployNonUpgradeable(hre, "VotesToken", [
    "USDC",
    "USDC",
    [signers[1].address, signers[2].address, signers[3].address],
    [
      ethers.utils.parseUnits("1000000.0", "ether"),
      ethers.utils.parseUnits("1000000.0", "ether"),
      ethers.utils.parseUnits("1000000.0", "ether"),
    ],
  ]);
  console.log("deployed PMP");
  console.log("deployed VotesToken");
};

export default func;
