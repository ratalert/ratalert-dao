const { encode, scheduleAndExecute } = require('./helper');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const TimelockController = artifacts.require('TimelockController');

contract('TimelockController', (accounts) => {
  const anon = accounts[1];
  const dao = accounts[9];

  before(async () => {
    this.timelockController = await TimelockController.deployed();
  });

  describe('grantRole()', () => {
    it('does not allow deployer to change roles', async () => {
      await expect(this.timelockController.grantRole(encode('PROPOSER_ROLE'), anon)).to.eventually.be.rejectedWith('is missing role');
      await expect(this.timelockController.grantRole(encode('EXECUTOR_ROLE'), anon)).to.eventually.be.rejectedWith('is missing role');
    });
    it('allows itself to change roles', async () => {
      await scheduleAndExecute(this.timelockController, 'grantRole', [encode('PROPOSER_ROLE'), anon], { from: dao });
      await expect(this.timelockController.hasRole(encode('PROPOSER_ROLE'), anon)).to.eventually.be.true;
    });
  });
});
