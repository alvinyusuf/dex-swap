// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin-contracts-5.1.0/access/Ownable.sol";

error Unauthorized();

contract Token is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address initialOwner)
        ERC20(name, symbol)
        Ownable(initialOwner)
    {
        _transferOwnership(initialOwner);
        _mint(initialOwner, initialSupply * (10 ** uint256(decimals())));
    }
}
