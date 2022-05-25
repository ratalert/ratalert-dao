const mri = require('mri');
const { scheduleAndExecute, encodeFunctionCall, encode } = require('../test/helper');

const commands = {
    grantRole: async(contract, role, account) => {
        if (account === 'dao') account = this.config.dao.address;
        const res = await scheduleAndExecute(await getInst(contract), 'grantRole', [encode(role), account], { from: this.config.dao.address, network: this.network, raw: this.network === 'main' });
        if (res) console.log(res);
    },
};

module.exports = async (callback) => {
    const argv = mri(process.argv.slice(4));
    const [cmd, ...args] = argv._
    const exec = commands[cmd];

    this.network = argv.network || 'develop';
    this.accounts = await web3.eth.getAccounts();
    this.config = require('../config')(this.network, this.accounts);
    this.getInst = contract => artifacts.require(contract).deployed();
    this.executeOrEncode = (instance, method, args, options = {}) => {
        if (this.network === 'main') {
            const data = encodeFunctionCall(instance, method, args);
            console.log(`Address: ${instance.address}\n\nABI:\n${JSON.stringify(instance.abi)}\n\nData: ${data}`);
            return;
        }
        return instance[method](...args, { from: this.config.dao.address, ...options });
    };

    global.artifacts = artifacts;
    global.web3 = web3;

    if (!exec) {
        console.log('Usage: truffle exec bin/cli.js <cmd>');
        console.log('Commands:');
        Object.keys(commands).map(c => console.log(' ', c, commands[c].toString().split('\n')[0].match(/\((.*)\)/)[1].split(', ').map(a => a ? `<${a}>` : '').join(' ')));
        return callback();
    }
    if (args.length !== exec.length) {
        console.log(`${cmd} requires ${exec.length} argument(s):`, exec.toString().split('\n')[0].match(/\((.*)\)/)[1].split(', ').map(a => a ? `<${a}>` : '').join(' '));
        return callback();
    }
    await exec(...args, callback);
    callback();
};
