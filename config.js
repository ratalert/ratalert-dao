const env = (key, def) => { return process.env[key] || def; };
const num = (key, def) => { return Number(env(key, def)); };

module.exports = (network, accounts = []) => ({
  dao: {
    address: env('DAO_ADDRESS', accounts ? accounts[9] : ''),
  },
  fastFood: {
    address: env('FASTFOOD_ADDRESS', ''),
  },
  timelock: {
    address: env('TIMELOCK_ADDRESS'),
    minDelay: num('TIMELOCK_MIN_DELAY', (60 * 60 * 24 * 2).toString()),
    proposers: env('TIMELOCK_PROPOSERS', accounts ? accounts[9] : ''),
    executors: env('TIMELOCK_EXECUTORS', accounts ? accounts[9] : ''),
  },
  governor: {
    votingDelay: num('GOVERNOR_VOTING_DELAY', (1).toString()),
    votingPeriod: num('GOVERNOR_VOTING_PERIOD', (78).toString()),
    proposalThreshold: num('GOVERNOR_PROPOSAL_THRESHOLD', (0).toString()),
    quorumNumeratorValue: num('GOVERNOR_QUORUM_NUMERATOR_VALUE', (4).toString()),
  },
});
