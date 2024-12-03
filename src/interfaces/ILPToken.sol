// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ILPToken {
    // Events
    event FactorySet(address indexed factory);
    event PairAdded(address indexed pair);
    event PairRemoved(address indexed pair);

    // View functions
    function factory() external view returns (address);

    function validPairs(address pair) external view returns (bool);

    // Administrative functions
    function addValidPair(address pair) external;

    function removeValidPair(address pair) external;

    // Token management functions
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;
}
