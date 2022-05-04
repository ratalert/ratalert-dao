const { scheduleAndExecute } = require('./helper');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const DummyV1 = artifacts.require('Dummy');
const Dummy = artifacts.require('DummyV2');

contract('DummyV2', (accounts) => {
  const anon = accounts[1];
  const dao = accounts[9];

  before(async () => {
    this.dummyV1 = await DummyV1.deployed();
    this.dummy = await Dummy.deployed();
    this.dummy.address = this.dummyV1.address;
  });

  describe('del()', () => {
    it('denies access to anon', async () => {
      await expect(this.dummy.del(anon, { from: anon })).to.eventually.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('allows access TimelockController', async () => {
      const res = await scheduleAndExecute(this.dummy, 'del', [anon], { from: dao });
      expect(res.receipt.status).to.be.true;
      expect((await this.dummy.get(anon)).toString()).to.equal('0');
    });
  });
});
