exports.toWei = (ether) => web3.utils.toWei(ether.toString(), 'ether');
exports.fromWei = (wei) => Number(web3.utils.fromWei(wei, 'ether'));
exports.encode = role => web3.utils.soliditySha3(web3.utils.fromAscii(role));
exports.getFunctionCalldata = (contract, func, args) => {
  const abi = contract.abi.find(item => item.name === func);
  return web3.eth.abi.encodeFunctionCall(abi, args);
};
exports.scheduleAndExecute = async (contract, func, args, options, salt = 0, delay = 0) => {
  const timelockController = await artifacts.require('TimelockController').deployed();
  const abi = contract.abi.find(item => item.name === func);
  const data = web3.eth.abi.encodeFunctionCall(abi, args);
  const timelockArgs = [
    contract.address,
    0, // value
    data,
    '0x0', // predecessor
    `0x${salt}`, // salt
    delay,
  ];
  await timelockController.schedule(...timelockArgs, options);
  await new Promise(resolve => setTimeout(resolve, delay * 1000));
  return timelockController.execute(...timelockArgs.slice(0, -1), options);
};
exports.advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [time],
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err); }
      return resolve(result);
    });
  });
};
exports.advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime()
    }, (err) => {
      if (err) { return reject(err); }
      const newBlockHash = web3.eth.getBlock('latest').hash;

      return resolve(newBlockHash);
    });
  });
};
exports.advanceTimeAndBlock = async (time) => {
  await exports.advanceTime(time);
  await exports.advanceBlock();
  return Promise.resolve(web3.eth.getBlock('latest'));
};
