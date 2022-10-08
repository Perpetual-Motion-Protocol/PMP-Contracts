import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
import {
  PerpetualMotionProtocol,
  PerpetualMotionProtocol__factory,
  VotesToken,
  VotesToken__factory,
} from "../typechain-types";

describe("PerpetualMotionProtocol", () => {
  // contracts
  let perpetual: PerpetualMotionProtocol;
  let votesToken: VotesToken;

  // Wallets
  let deployer: SignerWithAddress;
  let pledger1: SignerWithAddress;
  let pledger2: SignerWithAddress;
  let pledger3: SignerWithAddress;
  let fundingAddress1: SignerWithAddress;
  let fundingAddress2: SignerWithAddress;
  let fundingAddress3: SignerWithAddress;

  // Encode Data
  const abiCoder = new ethers.utils.AbiCoder();

  beforeEach(async () => {
    [
      deployer,
      pledger1,
      pledger2,
      pledger3,
      fundingAddress1,
      fundingAddress2,
      fundingAddress3,
    ] = await ethers.getSigners();

    perpetual = await new PerpetualMotionProtocol__factory(deployer).deploy(); // Perpetual Motion Contract
    votesToken = await new VotesToken__factory(deployer).deploy(
      // Votes Token
      "USDC",
      "USDC",
      [pledger1.address, pledger2.address, pledger3.address],
      [1000000, 1000000, 1000000]
    );
    await votesToken.connect(pledger1).approve(perpetual.address, "1000000");
    await votesToken.connect(pledger2).approve(perpetual.address, "1000000");
    await votesToken.connect(pledger3).approve(perpetual.address, "1000000");
  });

  describe("PMP Create Project", () => {
    it("Allows a user to set up a project", async () => {
      expect(await perpetual.projectCounter()).eq(0);
      await expect(
        perpetual.createProject(
          "Doin' Good",
          "ETH Barcelona",
          fundingAddress1.address,
          votesToken.address,
          1000000,
          1000
        )
      )
        .to.emit(perpetual, "ProjectCreated")
        .withArgs(
          fundingAddress1.address,
          "Doin' Good",
          "ETH Barcelona",
          1000000
        );

      expect(await perpetual.projectCounter()).eq(1);
    });
  });

  describe("Pledge A Project", () => {
    it("Allows a user to donate a lumpsum", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual
          .connect(pledger1)
          .pledge(0, 1, abiCoder.encode(["uint256"], [100000]))
      ).to.emit(perpetual, "PledgeCreated");

      expect(await votesToken.balanceOf(perpetual.address)).to.equal("100000");
      expect(await votesToken.balanceOf(pledger1.address)).to.equal("900000");
      expect(await (await perpetual.projects(0)).amountFunded).to.equal(
        "100000"
      );
      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).totalDonated
      ).to.equal("100000");
    });

    it("Allows a user to setup a donation stream", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual
          .connect(pledger1)
          .pledge(0, 2, abiCoder.encode(["uint256", "uint256"], [100000, 100]))
      ).to.emit(perpetual, "PledgeCreated");

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyType
      ).to.equal(2);

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyData
      ).to.equal(abiCoder.encode(["uint256", "uint256"], [100000, 100]));
    });

    it("Allows a user to setup a donation roundUp", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual.connect(pledger1).pledge(0, 3, ethers.constants.HashZero)
      ).to.emit(perpetual, "PledgeCreated");

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyType
      ).to.equal(3);

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyData
      ).to.equal(ethers.constants.HashZero);
    });

    it("Allows a user to set NO STRATEGY", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual.connect(pledger1).pledge(0, 0, ethers.constants.HashZero)
      ).to.emit(perpetual, "PledgeCreated");

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyType
      ).to.equal(0);

      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).strategyData
      ).to.equal("0x");
    });
  });

  describe("Execute Donations", () => {
    it("Allows a user to execute a stream", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual
          .connect(pledger1)
          .pledge(0, 2, abiCoder.encode(["uint256", "uint256"], [100000, 100]))
      ).to.emit(perpetual, "PledgeCreated");

      await network.provider.send("evm_increaseTime", [200]);
      await network.provider.send("evm_mine");

      expect(
        await perpetual.execute(
          [0],
          [[pledger1.address]],
          [[ethers.constants.HashZero]]
        )
      ).to.emit(perpetual, "Executed");

      expect(await votesToken.balanceOf(perpetual.address)).to.equal("200000");
      expect(await votesToken.balanceOf(pledger1.address)).to.equal("800000");
      expect(await (await perpetual.projects(0)).amountFunded).to.equal(
        "200000"
      );
      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).totalDonated
      ).to.equal("200000");
    });

    it("Allows a user to execute a roundUp", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual.connect(pledger1).pledge(0, 3, ethers.constants.HashZero)
      ).to.emit(perpetual, "PledgeCreated");

      expect(
        await perpetual.execute(
          [0],
          [[pledger1.address]],
          [
            [
              abiCoder.encode(
                ["bytes", "uint256"],
                [ethers.utils.hashMessage("Hello World"), 100000]
              ),
            ],
          ]
        )
      ).to.emit(perpetual, "Executed");

      expect(await votesToken.balanceOf(perpetual.address)).to.equal("100000");
      expect(await votesToken.balanceOf(pledger1.address)).to.equal("900000");
      expect(await (await perpetual.projects(0)).amountFunded).to.equal(
        "100000"
      );
      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).totalDonated
      ).to.equal("100000");
    });

    it("Allows a user to execute a stream", async () => {
      await perpetual.createProject(
        "Doin' Good",
        "ETH Barcelona",
        fundingAddress1.address,
        votesToken.address,
        1000000,
        1000
      );

      await expect(
        perpetual
          .connect(pledger1)
          .pledge(0, 2, abiCoder.encode(["uint256", "uint256"], [100000, 100]))
      ).to.emit(perpetual, "PledgeCreated");

      await expect(
        perpetual.connect(pledger2).pledge(0, 3, ethers.constants.HashZero)
      ).to.emit(perpetual, "PledgeCreated");

      await network.provider.send("evm_increaseTime", [900]);
      await network.provider.send("evm_mine");

      expect(
        await perpetual.execute(
          [0],
          [[pledger1.address, pledger2.address]],
          [
            [
              ethers.constants.HashZero,
              abiCoder.encode(
                ["bytes", "uint256"],
                [ethers.utils.hashMessage("Hello World"), 100000]
              ),
            ],
          ]
        )
      ).to.emit(perpetual, "Executed");

      expect(await votesToken.balanceOf(fundingAddress1.address)).to.equal(
        "1000000"
      );
      expect(await votesToken.balanceOf(perpetual.address)).to.equal("0");
      expect(await votesToken.balanceOf(pledger1.address)).to.equal("100000");
      expect(await votesToken.balanceOf(pledger2.address)).to.equal("900000");
      expect(await (await perpetual.projects(0)).amountFunded).to.equal(
        "1000000"
      );
      expect(
        await (
          await perpetual.projectToContributors(0, pledger1.address)
        ).totalDonated
      ).to.equal("900000");
      expect(
        await (
          await perpetual.projectToContributors(0, pledger2.address)
        ).totalDonated
      ).to.equal("100000");
    });
  });
});
