// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Token} from "./Token.sol";

contract TokenFactory {
    event TokenCreated(address indexed tokenAddress, address indexed owner, uint256 initialSupply);

    function createToken(address initialOwner, uint256 initialSupply, string memory name, string memory symbol)
        public
        returns (address)
    {
        Token newToken = new Token(name, symbol, initialSupply, initialOwner);
        emit TokenCreated(address(newToken), initialOwner, initialSupply);
        return address(newToken);
    }
}
