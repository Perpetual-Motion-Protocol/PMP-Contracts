import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const signers = await ethers.getSigners();
  const abiCoder = new ethers.utils.AbiCoder();

  const perpetualMotionProtocol = await hre.ethers.getContract(
    "PerpetualMotionProtocol"
  );
  const votesToken = await hre.ethers.getContract("VotesToken");

  // Approve perpetualMotionProtocol
  await votesToken
    .connect(signers[1])
    .approve(
      perpetualMotionProtocol.address,
      ethers.utils.parseUnits("1000000.0", "ether")
    );
  await votesToken
    .connect(signers[2])
    .approve(
      perpetualMotionProtocol.address,
      ethers.utils.parseUnits("1000000.0", "ether")
    );
  await votesToken
    .connect(signers[3])
    .approve(
      perpetualMotionProtocol.address,
      ethers.utils.parseUnits("1000000.0", "ether")
    );

  // Create Projects
  await perpetualMotionProtocol.createProject(
    "Doin' Good",
    "ETH Barcelona",
    signers[4].address,
    votesToken.address,
    ethers.utils.parseUnits("150000.0", "ether"),
    1000
  );

  await perpetualMotionProtocol.createProject(
    "ETH Global",
    "Hack-a-thon",
    signers[5].address,
    votesToken.address,
    ethers.utils.parseUnits("100000.0", "ether"),
    1000
  );

  // Create Pledges
  await perpetualMotionProtocol
    .connect(signers[1])
    .pledge(
      0,
      2,
      abiCoder.encode(
        ["uint256", "uint256"],
        [ethers.utils.parseUnits("1000.0", "ether"), 100]
      )
    );

  await perpetualMotionProtocol
    .connect(signers[2])
    .pledge(
      0,
      3,
      abiCoder.encode(
        ["uint256", "uint256"],
        [ethers.utils.parseUnits("1000.0", "ether"), 100]
      )
    );

  console.log(
    "Pledge1 " +
      (await (
        await perpetualMotionProtocol.projectToContributors(
          0,
          signers[1].address
        )
      ).strategyType)
  );
  console.log(
    "Pledge2 " +
      (await (
        await perpetualMotionProtocol.projectToContributors(
          0,
          signers[2].address
        )
      ).strategyType)
  );
};

export default func;
