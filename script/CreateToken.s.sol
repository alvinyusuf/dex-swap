// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std-1.9.4/src/Script.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import {console} from "forge-std-1.9.4/src/console.sol";

contract CreateToken is Script {
    function run() public {
        vm.startBroadcast();

        address initialOwner = msg.sender;
        uint256 initialSupply = 1000;
        string memory name = "MyToken";
        string memory symbol = "MTK";

        TokenFactory factory = new TokenFactory();

        address tokenAddress = factory.createToken(initialOwner, initialSupply, name, symbol);
        console.log("Token created at address:", tokenAddress);

        vm.stopBroadcast();
 }
}