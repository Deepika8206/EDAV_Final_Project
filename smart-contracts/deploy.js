const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const EDAVAccess = await ethers.getContractFactory("EDAVAccess");
  const edavAccess = await EDAVAccess.deploy();

  await edavAccess.deployed();
  console.log("EDAVAccess deployed to:", edavAccess.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });