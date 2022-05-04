const { prepareUpgrade, admin } = require('@openzeppelin/truffle-upgrades');
const { scheduleAndExecute } = require('../test/helper');

const Dummy = artifacts.require('Dummy');
const DummyNew = artifacts.require('DummyV2');

module.exports = async (deployer, network, accounts) => {
  if (network === 'development') {
    const dummy = await Dummy.deployed();

    const address = await prepareUpgrade(dummy.address, DummyNew, { deployer });
    const dummyNew = { address };
    const adminInstance = await admin.getInstance();

    global.web3 = web3;
    await scheduleAndExecute(adminInstance, 'upgrade', [dummy.address, dummyNew.address], { from: accounts[9] });
  }
};
