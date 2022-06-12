const hre = require("hardhat");
require("ethers");

async function main() {
  const [owner, cafeOwner] = await ethers.getSigners();
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
    [1, 2, 1], [0, 1, 2], [0, 10, 15], [0, 5, 10], 5, ethers.utils.parseEther("0.001"), cafeOwner.address, cafeOwner.address);
  const cafeTx = await cafeDeployment.wait();
  const event = cafeTx.events.find(event => event.event === "CafeContractCreated");
  const [cafeAddress] = event.args;
  console.log(`Created a CafeContract at address ${cafeAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
