const Config = require('../config');

const TimelockController = artifacts.require('TimelockController');

module.exports = async (deployer, network, accounts) => {
  const config = Config(network, accounts);

  await deployer.deploy(TimelockController, config.timelock.minDelay, config.timelock.proposers.split(' '), config.timelock.executors.split(' '));
};
