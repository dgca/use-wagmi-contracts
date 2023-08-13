// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Toggle {
  bool public value = false;

  function toggle() external returns(bool) {
    value = !value;
    return value;
  }

  function getValue() external view returns(bool) {
    return value;
  }
}
