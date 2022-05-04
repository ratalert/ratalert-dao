const { deployProxy, admin } = require('@openzeppelin/truffle-upgrades');

const TimelockController = artifacts.require('TimelockController');
const Dummy = artifacts.require('Dummy');

module.exports = async (deployer, network) => {
  if (network === 'development') {
    const contracts = ['Dummy'];

    const timelockController = await TimelockController.deployed();
    await deployProxy(Dummy, { deployer });

    console.log(`Changing ownership to TimelockController at ${timelockController.address}`);
    await contracts.reduce(async (previousPromise, name) => {
      await previousPromise;
      const contract = await artifacts.require(name).deployed();
      await contract.transferOwnership(timelockController.address);
    }, Promise.resolve());


    const adminInstance = await admin.getInstance();
    const adminOwner = await adminInstance.owner();
    if (adminOwner !== timelockController.address) {
      await admin.transferProxyAdminOwnership(timelockController.address);
    }
  }
};
