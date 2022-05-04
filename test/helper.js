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
