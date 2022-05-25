const Config = require('../config');
const { encode, scheduleAndExecute } = require('../test/helper');

const TimelockController = artifacts.require('TimelockController');
const GourmetFood = artifacts.require('DAOGourmetFood');
const RatGovernor = artifacts.require('RatGovernor');

global.web3 = web3;

module.exports = async (deployer, network, accounts) => {
  const config = Config(network, accounts);

  const timelockController = await TimelockController.deployed();

  let gourmetFood = { address: config.gourmetFood.address };
  if (network === 'development') {
    await deployer.deploy(GourmetFood, timelockController.address);
    gourmetFood = await GourmetFood.deployed();
    await gourmetFood.grantRole(web3.utils.soliditySha3(web3.utils.fromAscii('MINTER_ROLE')), config.dao.address);
    await gourmetFood.grantRole(web3.utils.soliditySha3(web3.utils.fromAscii('BURNER_ROLE')), config.dao.address);
  }

  await deployer.deploy(RatGovernor, gourmetFood.address, timelockController.address, ...Object.values(config.governor));
  const ratGovernor = await RatGovernor.deployed();
  console.log('RatGovernor', ratGovernor.address);

  // This block has to be done manually in Gnosis Safe on mainnet
  if (network === 'development') {
    await scheduleAndExecute(timelockController, 'grantRole', [encode('PROPOSER_ROLE'), ratGovernor.address], { from: config.dao.address });
    await scheduleAndExecute(timelockController, 'grantRole', [encode('EXECUTOR_ROLE'), ratGovernor.address], { from: config.dao.address });
  }
};
