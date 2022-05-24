const Config = require('../config');
const { encode } = require('../test/helper');

const TimelockController = artifacts.require('TimelockController');
const FastFood = artifacts.require('FastFood');
const DAOFastFood = artifacts.require('DAOFastFood');
const RatGovernor = artifacts.require('RatGovernor');

global.web3 = web3;

module.exports = async (deployer, network, accounts) => {
  const config = Config(network, accounts);

  await deployer.deploy(TimelockController, config.timelock.minDelay, config.timelock.proposers.split(' '), config.timelock.executors.split(' '));
  const timelockController = await TimelockController.deployed();

  let fastFood = { address: config.fastFood.address };
  if (network === 'development') {
    await deployer.deploy(FastFood, timelockController.address);
    fastFood = await FastFood.deployed();
    await fastFood.grantRole(web3.utils.soliditySha3(web3.utils.fromAscii('MINTER_ROLE')), config.dao.address);
    await fastFood.grantRole(web3.utils.soliditySha3(web3.utils.fromAscii('BURNER_ROLE')), config.dao.address);
  }

  await deployer.deploy(DAOFastFood, fastFood.address);
  const daoFastFood = await DAOFastFood.deployed();

  await deployer.deploy(RatGovernor, daoFastFood.address, timelockController.address, ...Object.values(config.governor));
  const ratGovernor = await RatGovernor.deployed();

  await timelockController.grantRole(encode('PROPOSER_ROLE'), ratGovernor.address);
  await timelockController.grantRole(encode('EXECUTOR_ROLE'), ratGovernor.address);
  await timelockController.renounceRole(encode('TIMELOCK_ADMIN_ROLE'), accounts[0]);
};
