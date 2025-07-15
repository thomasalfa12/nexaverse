// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockRegistry {
    mapping(address => bool) public isRegisteredInstitution;

    function registerInstitution(address inst) external {
        isRegisteredInstitution[inst] = true;
    }
}