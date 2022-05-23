const TimelockController = artifacts.require('TimelockController');

module.exports = async (deployer, network, accounts) => {
  const timelockController = await TimelockController.deployed();
  await timelockController.renounceRole(web3.utils.soliditySha3(web3.utils.fromAscii('TIMELOCK_ADMIN_ROLE')), accounts[0]);
};
