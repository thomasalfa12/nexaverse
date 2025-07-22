// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IISBTRegistry {
    function isVerifiedEntity(address _wallet) external view returns (bool);
    function owner() external view returns (address);
}