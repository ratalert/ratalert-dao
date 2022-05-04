const { scheduleAndExecute } = require('./helper');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const Dummy = artifacts.require('Dummy');

contract('Dummy', (accounts) => {
  const anon = accounts[1];
  const dao = accounts[9];

  before(async () => {
    this.dummy = await Dummy.deployed();
  });

  describe('set()', () => {
    it('denies access to anon', async () => {
      await expect(this.dummy.set(anon, 6, { from: anon })).to.eventually.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('allows access TimelockController', async () => {
      const res = await scheduleAndExecute(this.dummy, 'set', [anon, 9], { from: dao });
      expect(res.receipt.status).to.be.true;
      expect((await this.dummy.get(anon)).toString()).to.equal('9');
    });
  });
});
