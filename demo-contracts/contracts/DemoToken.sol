// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DemoToken is ERC20 {
  constructor() ERC20("DemoToken", "DEMO") {}

  function mint() public returns (bool) {
    _mint(msg.sender, 5 * 10 ** 18);
    return true;
  }
}