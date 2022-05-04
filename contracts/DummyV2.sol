// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DummyV2 is Initializable, OwnableUpgradeable {
  mapping (address => uint) values;

  function initialize() external initializer {
    __Ownable_init();
  }

  function get(address addr) external view returns(uint) {
    return values[addr];
  }

  function set(address addr, uint value) external onlyOwner {
    values[addr] = value;
  }

  function del(address addr) external onlyOwner {
    delete values[addr];
  }
}
