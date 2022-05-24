const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { toWei, encode, getFunctionCalldata } = require('./helper');
const { time } = require('@openzeppelin/test-helpers');

chai.use(chaiAsPromised);

const expect = chai.expect;
const FastFood = artifacts.require('FastFood');
const DAOFastFood = artifacts.require('DAOFastFood');
const TimelockController = artifacts.require('TimelockController');
const RatGovernor = artifacts.require('RatGovernor');

contract('RatGovernor', (accounts) => {
  const [proposer, voter1, voter2] = accounts;
  const dao = accounts[9];

  before(async () => {
    this.fastFood = await FastFood.deployed();
    this.daoFastFood = await DAOFastFood.deployed();
    this.timelockController = await TimelockController.deployed();
    this.ratGovernor = await RatGovernor.deployed();

    // Equip voters
    const amount1 = toWei(100);
    const amount2 = toWei(200);

    await this.fastFood.mint(voter1, amount1, { from: dao });
    await this.fastFood.mint(voter2, amount2, { from: dao });
    await this.fastFood.approve(this.daoFastFood.address, amount1, { from: voter1 });
    await this.fastFood.approve(this.daoFastFood.address, amount2, { from: voter2 });
    await this.daoFastFood.depositFor(voter1, amount1, { from: voter1 });
    await this.daoFastFood.depositFor(voter2, amount2, { from: voter2 });
    await this.daoFastFood.delegate(voter1, { from: voter1 });
    await this.daoFastFood.delegate(voter2, { from: voter2 });
  });

  describe('propose()', () => {
    it('creates a proopsal', async () => {
      const description = 'Proposal: Add proposer as executor';
      this.descriptionHash = web3.utils.keccak256(description);
      this.data = getFunctionCalldata(this.timelockController, 'grantRole', [encode('EXECUTOR_ROLE'), proposer]);
      const res = await this.ratGovernor.propose([this.timelockController.address], [0], [this.data], description, { from: proposer });
      this.block = (await web3.eth.getBlock('latest')).number;
      this.proposalId = res.logs[0].args.proposalId;
      expect(res.receipt.status).to.be.true;
      expect(this.proposalId).to.be.a.bignumber.gt('0');
      await expect(this.ratGovernor.proposalSnapshot(this.proposalId)).to.eventually.be.a.bignumber.eq((this.block + 1).toString());
      await expect(this.ratGovernor.proposalDeadline(this.proposalId)).to.eventually.be.a.bignumber.eq((this.block + 1 + 78).toString());
    });
  });

  describe('castVote', () => {
    it('cannot vote immediately', async () => {
      await expect(this.ratGovernor.castVote(this.proposalId, 0, { from: voter1 })).to.eventually.be.rejectedWith('vote not currently active');
    });
    it('accepts vote from voter1', async () => {
      const block = await this.ratGovernor.proposalSnapshot(this.proposalId);
      await time.advanceBlockTo(block);

      const res = await this.ratGovernor.castVote(this.proposalId, 0, { from: voter1 });
      expect(res.logs[0].args.weight).to.be.a.bignumber.eq(toWei(100));
    });
    it('accepts vote from voter2', async () => {
      const res = await this.ratGovernor.castVote(this.proposalId, 1, { from: voter2 });
      expect(res.logs[0].args.weight).to.be.a.bignumber.eq(toWei(200));
    });
    it('executes a successful proposal', async () => {
      const block = await this.ratGovernor.proposalDeadline(this.proposalId);
      await time.advanceBlockTo(block);

      await this.ratGovernor.queue([this.timelockController.address], [0], [this.data], this.descriptionHash, { from: dao });
      await this.ratGovernor.execute([this.timelockController.address], [0], [this.data], this.descriptionHash, { from: dao });
      await expect(this.timelockController.hasRole(encode('EXECUTOR_ROLE'), proposer)).to.eventually.be.true;
      await expect(this.ratGovernor.quorum(block)).to.eventually.be.a.bignumber.eq(toWei(12));
    });
  });
});
