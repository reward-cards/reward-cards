const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CafeTest", function () {
  it("Can work end to end", async function () {
    const [owner, cafeOwner, user] = await ethers.getSigners();
    const CafeRegistry = await ethers.getContractFactory("CafeRegistry");
    const cafeRegistry = await CafeRegistry.deploy();
    await cafeRegistry.deployed();
    console.log(`Deployed CafeRegistry at address ${cafeRegistry.address}`);

    const CafeCore = await ethers.getContractFactory("CafeCore");
    const cafeCore = await CafeCore.deploy(cafeOwner.address, cafeRegistry.address);
    await cafeCore.deployed();
    console.log(`Deployed CafeCore at address ${cafeCore.address}`);

    await cafeRegistry.setCafeCore(cafeCore.address);
    console.log("Set CafeCore");

    const cafeDeployment = await cafeRegistry.createCafeContract(["Coffee", "Brownie", "Lemonade"],
      [ethers.utils.parseEther("0.001"), ethers.utils.parseEther("0.002"), ethers.utils.parseEther("0.0015")],
      [100, 200, 150], [0, 1, 2], [0, 5, 10], [0, 500, 1000], 500, ethers.utils.parseEther("0.001"), cafeOwner.address, cafeOwner.address);
    const cafeTx = await cafeDeployment.wait();
    const CafeContract = await ethers.getContractFactory("CafeContract");
    const event = cafeTx.events.find(event => event.event === "CafeContractCreated");
    const [cafeAddress] = event.args;
    const cafeContract = await CafeContract.attach(cafeAddress);
    console.log(`Created a CafeContract at address ${cafeAddress}`);

    expect(await cafeContract.balanceOf(user.address, 0)).to.equal(0);
    expect(await cafeContract.balanceOf(user.address, 1)).to.equal(0);
    expect(await cafeContract.balanceOf(user.address, 2)).to.equal(0);

    await cafeCore.connect(user).executeOrder(cafeAddress, ["Coffee", "Brownie"], [3, 2], { value: ethers.utils.parseEther("0.007") });
    console.log("Paid for 3 Coffees and 2 Brownies.");

    expect(await cafeContract.balanceOf(user.address, 0)).to.equal(700);
    expect(await cafeContract.balanceOf(user.address, 1)).to.equal(0);
    expect(await cafeContract.balanceOf(user.address, 2)).to.equal(1);

    await cafeCore.connect(user).executeOrder(cafeAddress, ["Coffee"], [5], { value: ethers.utils.parseEther("0.005") });

    expect(await cafeContract.balanceOf(user.address, 0)).to.equal(1200);
    expect(await cafeContract.balanceOf(user.address, 1)).to.equal(1);
    expect(await cafeContract.balanceOf(user.address, 2)).to.equal(2);
  });
});
