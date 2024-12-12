// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std-1.9.4/src/Test.sol";
import {Token} from "../src/Token.sol";

contract TokenTest is Test {
    Token token;
    string name = "TestToken";
    string symbol = "TT";
    uint256 initialSupply = 1000;
    address initialOwner;

    function setUp() public {
        initialOwner = address(this);
        token = new Token(name, symbol, initialSupply, initialOwner);
    }

    function testInitialOwner() public view {
        assertEq(token.owner(), initialOwner);
    }

    function testInitialSupply() public view {
        uint256 expectedSupply = initialSupply * 10 ** token.decimals();
        assertEq(token.totalSupply(), expectedSupply);
        assertEq(token.balanceOf(initialOwner), expectedSupply);
    }

    function testNameAndSymbol() public view {
        assertEq(token.name(), name);
        assertEq(token.symbol(), symbol);
    }
}
